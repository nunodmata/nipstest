<template>
  <div>
    <v-container fluid>
      <v-row dense>
        <v-col key="Histórico" :cols="6">
          <v-card v-if="historico" dark>
            <v-card-title>Histórico das Rotas</v-card-title>

            <v-card-title>
              <v-menu
                ref="menuData"
                v-model="menuData"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-btn color="rgb(52, 122, 141)" small @blur="data" v-on="on"
                    >Data:
                    {{
                      data.split("-")[2] +
                      "/" +
                      data.split("-")[1] +
                      "/" +
                      data.split("-")[0]
                    }}</v-btn
                  >
                </template>
                <v-date-picker
                  v-model="data"
                  no-title
                  @input="menuData = false"
                ></v-date-picker>
              </v-menu>
            </v-card-title>
            <v-data-table
              style="height: 580px"
              :headers="hstCircuitosHeader"
              :items="historico"
              :search="search"
              dark
            >
              <template v-slot:[`item.id`]="{ item }">
                <v-btn
                  class="mx-2"
                  fab
                  dark
                  small
                  color="rgb(52, 122, 141)"
                  @click="pesquisarCircuito(item)"
                >
                  <v-icon dark>mdi-magnify-plus</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col :cols="6" style="height: 580px">
          <v-card style="height: 580px; width: 100%" dark>
            <v-card-title>
              Mapa
              <v-spacer></v-spacer>
            </v-card-title>
            <l-map
              v-if="showMap"
              :zoom="zoom"
              :center="center"
              :options="mapOptions"
              @update:center="centerUpdate"
              v-on:update:zoom="updateZoom($event)"
              ref="mymap"
            >
              <l-marker
                :lat-lng="getlatLng(41.38150949313275, -8.380767029624579)"
              >
                <l-icon
                  :icon-size="dynamicSizeCamiao"
                  :icon-anchor="dynamicAnchorCamiao"
                  :icon-url="'https://vitrus-admin.nips.pt/img/resinorte.png'"
                />
                <l-popup>
                  <div>Resinorte</div>
                </l-popup>
              </l-marker>

              <l-polyline
                v-if="cartrack"
                :lat-lngs="cartrack"
                color="#347a8d"
              ></l-polyline>
              <l-geo-json
                v-if="geojson"
                :geojson="geojson"
                :options-style="myStyle"
              ></l-geo-json>
              <l-tile-layer :url="url" :attribution="attribution" />
              <template v-if="report">
                <l-marker
                  id="marker.id"
                  v-for="marker in report"
                  :key="marker.id"
                  :visible="marker.position"
                  :draggable="marker.draggable"
                  :lat-lng="marker.position"
                >
                  <l-icon
                    :icon-size="dynamicSize"
                    :icon-anchor="dynamicAnchor"
                    :icon-url="
                      'https://vitrus-admin.nips.pt/img/' +
                      getColorNivelSensor(marker.nivel) +
                      '.png'
                    "
                  />
                </l-marker>
              </template>
            </l-map>
          </v-card>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col key="reports" :cols="8" v-if="selecionado">
          <v-card v-if="report" dark>
            <v-card-title>
              Histórico dos Reports
              <v-btn
                v-if="selecionado"
                class="mx-2"
                fab
                dark
                small
                color="rgb(52, 122, 141)"
                @click="exportar()"
              >
                <v-icon dark>mdi-export-variant</v-icon>
              </v-btn>
            </v-card-title>
            <v-data-table
              :headers="historicoHeader"
              :items="report"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
              dark
            >
              <template v-slot:[`item.sensor`]="{ item }">
                <v-icon
                  v-if="item.sensor"
                  title="Sensor Ligado"
                  color="green"
                  dark
                  >mdi-wifi</v-icon
                >
                <v-icon v-if="!item.sensor" title="Sem Sensor" color="grey" dark
                  >mdi-wifi</v-icon
                >
              </template>
              <template v-slot:[`item.fotos`]="{ item }">
                <a
                  v-for="foto in item.fotos"
                  :key="foto.id"
                  :href="imagemFoto(foto.url)"
                  target="_blank"
                >
                  <img :src="imagemFoto(foto.url)" height="70px" width="70px" />
                </a>
              </template>

              <template v-slot:[`item.report`]="{ item }">
                <v-icon
                  title="Lixo recolhido"
                  large
                  dark
                  :color="item.recolheuLixo ? 'green' : 'grey'"
                  tile
                  >mdi-check</v-icon
                >
                <v-icon
                  title="Lixo fora do contentor"
                  dark
                  :color="item.lixofora ? '#ebbf41' : 'grey'"
                  tile
                  >mdi-basket-unfill</v-icon
                >
                <v-icon
                  title="Tampa Partida"
                  dark
                  :color="item.tampaPartida ? '#347a8d' : 'grey'"
                  tile
                  >mdi-delete-empty</v-icon
                >
                <v-icon
                  :color="item.temAvaria ? '#f24747' : 'grey'"
                  title="Tem Avaria"
                  >mdi-delete-forever</v-icon
                >
                <v-icon
                  title="Precisa de limpeza"
                  dark
                  :color="item.precisaLimpeza ? '#fa8748' : 'grey'"
                  tile
                  >mdi-broom</v-icon
                >
              </template>

              <template v-slot:[`item.position`]="{ item }">
                <v-btn
                  class="mx-2"
                  fab
                  dark
                  small
                  color="rgb(52, 122, 141)"
                  @click="centerZoom(item.position)"
                >
                  <v-icon dark>mdi-magnify-plus</v-icon>
                </v-btn>
              </template>
              <template v-slot:[`item.nivel`]="{ item }">
                <v-chip
                  :color="getColorNivelSensorTabela(item.nivel)"
                  dark
                  v-if="item.nivel"
                  >{{ item.nivel }}%</v-chip
                >
              </template>
            </v-data-table>
          </v-card>
        </v-col>
        <v-col key="registro" :cols="4">
          <v-card v-if="selecionado.kms" dark>
            <v-card-title>Histórico de Registros</v-card-title>
            <v-data-table
              :headers="registrosHeader"
              :items="selecionado.kms"
              dark
            >
              <template v-slot:[`item.data_registro`]="{ item }">{{
                new Date(item.data_registro).toLocaleString()
              }}</template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { icon, latLng } from "leaflet";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LGeoJson,
  LIcon,
  LPolyline,
} from "vue2-leaflet";
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});
export default {
  name: "Report",

  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LGeoJson,
    LIcon,
    LPolyline,
  },
  data: () => ({
    data: new Date().toISOString().substr(0, 10),
    dateFormatted: new Date(),
    menuData: false,
    myStyle: {
      weight: 2,
      color: "rgb(142, 140, 140)",
      fillColor: "#5f5f5f",
    },
    sortBy: "data",
    sortDesc: false,
    historicoHeader: [
      { text: "Id", value: "id" },
      { text: "Contentor", value: "contentor" },
      { text: "Sensor", value: "sensor" },
      { text: "Data", value: "data" },
      { text: "Reports", value: "report" },
      { text: "Rua", value: "rua" },
      { text: "Ultimo Nivel", value: "nivel" },
      { text: "Fotos", value: "fotos" },
      { text: "Mapa ", value: "position", sortable: false },
    ],
    historico: [],
    registrosHeader: [
      { text: "Km", value: "km" },
      { text: "Tipo", value: "tipo" },
      { text: "Quantidade", value: "quantidade" },
      { text: "Data", value: "data_registro" },
    ],
    hstCircuitosHeader: [
      { text: "Visualizar", value: "id", sortable: true },
      { text: "Camião", value: "lcamiao" },
      { text: "Rota", value: "lrota" },
      { text: "Funcionário", value: "lfuncionario" },
      { text: "Data", value: "ldata" },
    ],
    report: [],
    rotas: [],
    cartrack: [],
    search: "",
    selecionado: false,
    markers: [
      {
        id: "m1",
        position: { lat: 47.41322, lng: -1.2 },
        tooltip: "tooltip for marker1",
        icon: icon.glyph({
          prefix: "mdi",
          glyph: "trash-can-outline",
        }),
      },
    ],
    caminhoes: [],
    zoom: 11,
    center: latLng(41.460349, -8.3771063, 12),
    url:
      "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
    attribution: "",
    withPopup: latLng(47.41322, -1.219482),
    withTooltip: latLng(47.41422, -1.250482),
    currentZoom: 11.5,
    currentCenter: latLng(47.41322, -1.219482),
    showParagraph: false,
    mapOptions: {
      zoomSnap: 0.5,
    },
    showMap: true,
    geojson: null,
    iconSize: 45,
  }),
  methods: {
    getColorNivelSensorTabela(nivel) {
      if (nivel > 75) return "#f24747";
      else if (nivel > 55) return "#fa8748";
      else if (nivel) return "#3a983e";
      else return "white";
    },
    imagemFoto(imagem) {
      return `https://vitrus-admin.nips.pt${imagem}`;
    },
    getColorNivelSensor(nivel) {
      if (nivel > 75) return "red";
      else if (nivel > 55) return "orange";
      else if (nivel) return "green";
      else return "white";
    },
    getlatLng: function (lat, lng) {
      return { lat, lng };
    },
    updateZoom: function (e) {
      this.zoom = e;
    },
    centerZoom(position) {
      this.zoom = 17;
      this.zoomUpdate = 17;
      this.center = latLng(0, 0);
      setTimeout(() => {
        this.center = position;
      }, 500);
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    exportar() {
      this.$http
        .get("relatorios/rota/" + this.selecionado.id, {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((response) => {
          this.$router.push();

          var link = document.createElement("a");
          link.href = "https://vitrus-admin.nips.pt/" + response.data;
          link.target = "_blank";
          link.download = "fileName";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch(() => {});
    },
    pesquisarCircuito(item) {
      this.selecionado = item;
      this.getCarTrack(item);

      this.report = [];
      item.reports.forEach((i) => {
        this.$http
          .get("/contentors/" + i.contentor, {
            headers: {
              Authorization: `Bearer ${this.getObjeto("token")}`,
            },
          })
          .then((response) => {
            var contentor = response.data;
            this.report.push({
              id: i.id,
              sensor: contentor.sensor ? true : false,
              data: new Date(i.data).toLocaleString(),
              contentor: contentor.numero_contentor,
              rua: contentor.rua,
              recolheuLixo: i.recolheuLixo,
              report: true,
              tampaPartida: i.tampaPartida,
              lixofora: i.lixofora,
              temAvaria: i.temAvaria,
              precisaLimpeza: i.precisaLimpeza,
              nivel: i.nivel,
              fotos: i.fotos,
              position: latLng(contentor.lat, contentor.lng),
            });
          });
      });
    },
    getHistoricoCircuitos(data) {
      data = new Date(data);
      var dataMenor = data.toISOString().split("T")[0] + "T00:00:00.000Z";
      var dataMaior = data.toISOString().split("T")[0] + "T23:59:59.000Z";

      this.$http
        .get("rotas", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((responseRotas) => {
          var rotas = responseRotas.data;
          this.$http
            .get(
              "historicocircuitos?_sort=id:DESC&created_at_lt=" +
                dataMaior +
                "&created_at_gt=" +
                dataMenor,
              {
                headers: {
                  Authorization: `Bearer ${this.getObjeto("token")}`,
                },
              }
            )
            .then((response) => {
              this.historico = response.data;

              this.historico.forEach((hst) => {
                hst.lcamiao = hst.caminhao.matricula;

                var rota = hst.reports[0]
                  ? rotas.find((x) => x.id == hst.reports[0].rota)
                  : "";
                hst.lrota = rota ? rota.nome : "";
                hst.lfuncionario = hst.user.nome;
                hst.ldata = new Date(hst.updated_at).toLocaleString();
              });
            });
        });
    },
    getObjeto(nome) {
      return localStorage.getItem(nome)
        ? JSON.parse(localStorage.getItem(nome))
        : null;
    },
    setObjeto(nome, objeto) {
      return localStorage.setItem(nome, JSON.stringify(objeto));
    },
    convertData(data) {
      return new Date(data).toLocaleString();
    },
    getCarTrack(item) {
      var inicio = "";
      var fim = "";
      item.kms.forEach((km) => {
        if (km.tipo == "inicio") {
          inicio = km.data_registro.substring(0, km.data_registro.length - 5);
        } else if (km.tipo == "final") {
          fim = km.data_registro.substring(0, km.data_registro.length - 5);
        }
      });
      this.$http
        .get(
          "arcgis/camioesdatahora/" +
            item.caminhao.id_cartrack +
            "/" +
            inicio +
            "/" +
            fim,
          {
            headers: {
              Authorization: `Bearer ${this.getObjeto("token")}`,
            },
          }
        )
        .then((response) => {
          this.cartrack = response.data;
        })
        .catch(function () {
          // handle error

          this.cartrack = undefined;
          this.centerZoom(this.center);
        });
    },
  },
  mounted() {
    setTimeout(function () {
      window.dispatchEvent(new Event("resize"));
    }, 500);

    const map = this.$refs.mymap.mapObject;
    map.addControl(new L.Control.Fullscreen());
  },
  watch: {
    data: function (data) {
      this.getHistoricoCircuitos(data);
    },
  },
  computed: {
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    },

    dynamicSizeCamiao() {
      return [this.iconSizeCamiao, this.iconSizeCamiao * 1.15];
    },
    dynamicAnchorCamiao() {
      return [this.iconSizeCamiao / 2, this.iconSizeCamiao * 1.15];
    },
    computedDateFormatted() {
      return this.formatDate(this.date);
    },
  },

  created() {
    this.getHistoricoCircuitos(new Date());

    this.$http
      .get("https://vitrus-admin.nips.pt/guimaraes.geojson")
      .then((response) => {
        this.geojson = response.data;
      });
  },
};
</script>