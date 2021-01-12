<template>
  <div>
    <v-container fluid>
      <v-row dense>
        <v-col key="hstTipos" :cols="2">
          
          <v-card v-if="tipos" dark>
            <v-card-title>Tipos de Reports</v-card-title>
            <v-data-table
              v-model="tiposSelected"
              :headers="tiposHeader"
              :items="tipos"
              :single-select="false"
              show-select
              dark
            >
              <template v-slot:[`item.icon`]="{ item }">
                <v-icon large dark :color="item.cor" tile
                  >mdi-{{ item.icon }}</v-icon
                >
              </template>
            </v-data-table>
          </v-card>
        </v-col>
        <v-col key="Histórico" :cols="10">
          <v-card v-if="historico" dark>
            <v-card-title>Histórico dos Reports</v-card-title>

            <v-card-title>
              <v-menu
                ref="menuDataInicio"
                v-model="menuDataInicio"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"     
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    color="rgb(52, 122, 141)"
                    small
                    @blur="dataInicio"
                    v-on="on"
                    >Data Inicial:
                    {{
                      dataInicio.split("-")[2] +
                      "/" +
                      dataInicio.split("-")[1] +
                      "/" +
                      dataInicio.split("-")[0]
                    }}</v-btn
                  >
                </template>
                <v-date-picker
                  v-model="dataInicio"
                  :max="
                    new Date().getFullYear() +
                    '-' +
                    (new Date().getMonth() + 1) +
                    '-' +
                    new Date().getDay()
                  "
                  no-title
                  @input="menuDataInicio = false"
                ></v-date-picker>
              </v-menu>
              <v-menu
                ref="menuDataFim"
                v-model="menuDataFim"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    color="rgb(52, 122, 141)"
                    small
                    @blur="dataFim"
                    v-on="on"
                    >Data Final:
                    {{
                      dataFim.split("-")[2] +
                      "/" +
                      dataFim.split("-")[1] +
                      "/" +
                      dataFim.split("-")[0]
                    }}</v-btn
                  >
                </template>
                <v-date-picker
                  v-model="dataFim"
                  no-title
                  @input="menuDataFim = false"
                ></v-date-picker>
              </v-menu>
            </v-card-title>
            <v-card-title></v-card-title>

            <v-data-table
              :headers="historicoHeader"
              :items="historico"
              :search="search"
              dark
            >
              <template v-slot:[`item.sensor`]="{ item }">
                <v-icon
                  title="Sensor Ligado"
                  color="green"
                  dark
                  v-if="item.sensor"
                  >mdi-wifi</v-icon
                >
                <v-icon title="Sem Sensor" color="grey" dark v-if="!item.sensor"
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

                <v-icon
                  title="Tem monstro"
                  dark
                  :color="item.monstros ? '#6e6eba' : 'grey'"
                  >mdi-seat</v-icon
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
      </v-row>
    </v-container>
  </div>
</template>

<script>
/* eslint-disable */
import { icon, latLng } from "leaflet";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LGeoJson,
  LIcon,
  LPolyline,
} from "vue2-leaflet";

export default {
  name: "reportDiario",

  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    LGeoJson,
    LIcon,
    LPolyline,
  },
  data: () => ({
    tiposHeader: [
      { text: "", value: "icon" },
      { text: "Tipo", value: "tipo" },
    ],
    tipos: [
      {
        id: 1,
        tipo: "Recolha de lixo",
        icon: "check",
        cor: "green",
        cd: "recolheuLixo",
      },// deletefromhere
       {
        id: 2,
        tipo: "Tampa partida",
        icon: "percentage-icon",
        cor: "#347a8d",
        cd: "tampaPartida",
      },
      {
        id: 2,
        tipo: "Tampa partida",
        icon: "delete-empty",
        cor: "#347a8d",
        cd: "tampaPartida",
      },
      {
        id: 3,
        tipo: "Tem anomalia",
        icon: "delete-forever",
        cor: "#f24747",
        cd: "temAvaria",
      },
      {
        id: 4,
        tipo: "Precisa de limpeza",
        icon: "broom",
        cor: "#fa8748",
        cd: "precisaLimpeza",
      },
      {
        id: 5,
        tipo: "Lixo fora do Contentor",
        icon: "basket-unfill",
        cor: "#ebbf41",
        cd: "lixofora",
      },
      {
        id: 6,
        tipo: "Tem Monstro",
        icon: "seat",
        cor: "#6e6eba",
        cd: "monstros",
      },
    ],
    tiposSelected: [],
    historicoHeader: [
      { text: "Contentor", value: "contentor" },
      { text: "Sensor", value: "sensor" },
      { text: "Data", value: "data" },
      { text: "Reports", value: "report" },
      { text: "Rua", value: "rua" },
      { text: "Rota", value: "rota" },
      { text: "Camião", value: "caminhao" },
      { text: "Motorista", value: "motorista" },
      { text: "Ultimo Nivel", value: "nivel" },
      { text: "Fotos", value: "fotos" },
    ],
    historico: [],
    historicoRoot: [],
    reports: {},
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), "01")
      .toISOString()
      .substr(0, 10),
    dataFim: new Date().toISOString().substr(0, 10),
    dateFormatted: new Date(),
    menuDataInicio: false,
    menuDataFim: false,
    combustiveis: [],
    combustiveisRoot: [],
    combustiveisTotal: 0,
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
    parseDate(date) {
      if (!date) return null;
      console.log(date);
      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    getColorNivelSensorTabela(nivel) {
      if (nivel > 74) return "#f24747";
      else if (nivel > 49) return "#fa8748";
      else if (nivel > 24) return "#ccc800";
      else return "#3a983e";
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
    getReports() {
      this.$http
        .get("reports?_sort=data:DESC", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((response) => {
          this.tiposSelected = this.tipos;
          console.log(response);
          this.historico = [];
          this.reports = response.data;
          response.data.forEach((i) => {
            var fotos = "";
            i.fotos.forEach((foto) => {});
            this.historico.push({
              id: i.id,
              sensor: i.contentor.sensor ? true : false,
              dataInterno: new Date(i.data),
              data: new Date(i.data).toLocaleString(),
              caminhao: i.caminhao.matricula,
              motorista: i.user.nome,
              rota: i.rota.nome,
              contentor: i.contentor.numero_contentor,
              rua: i.contentor.rua,
              recolheuLixo: i.recolheuLixo,
              report: true,
              tampaPartida: i.tampaPartida,
              lixofora: i.lixofora,
              temAvaria: i.temAvaria,
              precisaLimpeza: i.precisaLimpeza,
              monstros: i.monstros,
              nivel: i.nivel,
              fotos: i.fotos,
              position: latLng(i.contentor.lat, i.contentor.lng),
            });
          });

          this.historicoRoot = this.historico;
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
    filtro() {
      this.historico = [];
      var dataInicio = new Date(this.dataInicio);
      var dataFim = new Date(this.dataFim);
      this.historicoRoot.forEach((h) => {
        if (
          dataInicio < new Date(h.dataInterno) &&
          dataFim.setDate(dataFim.getDate() + 1) > new Date(h.dataInterno)
        ) {
          var obj = null;
          this.tiposSelected.forEach((t) => {
            if (h[t.cd] == true) {
              obj = h;
            }
          });
          if (obj) {
            console.log("passou aqui");
            this.historico.push(obj);
          }
        }
      });
    },
  },
  computed: {
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    },
    computedDateFormatted() {
      return this.formatDate(this.date);
    },
  },

  created() {
    this.getReports();
  },
  watch: {
    tiposSelected: function (val) {
      this.filtro();
    },
    dataInicio: function (val) {
      this.filtro();
    },
    dataFim: function (val) {
      this.filtro();
    },
  },
};
</script>