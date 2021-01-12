<template>
  <div>
    <v-container fluid>
      <v-row dense>
        <v-col key="toneladasAno" :cols="3">
          <v-card dark>
            <v-card-title>
              Tonelada do Ano: {{ dateFormatted.getFullYear() }}
              <v-spacer></v-spacer>
            </v-card-title>
            <center>
              <h1>{{ toneladaAno.toLocaleString("pt-PT") }}</h1>
            </center>
          </v-card>
        </v-col>
        <v-col key="toneladasMes" :cols="3">
          <v-card dark>
            <v-card-title>
              Tonelada do Mês: {{ meses[dateFormatted.getMonth()] }}
              <v-spacer></v-spacer>
            </v-card-title>
            <center>
              <h1>{{ toneladaMes.toLocaleString("pt-PT") }}</h1>
            </center>
          </v-card>
        </v-col>
        <v-col key="emBranco" :cols="6"></v-col>
        <v-col key="Contentores" :cols="5" style="height: 100%">
          <v-card dark v-if="contentores">
            <v-card-title>
              <v-btn
                v-if="contentoresselected.length == 0"
                class="mx-2"
                fab
                dark
                small
                color="rgb(52, 122, 141)"
                @click="contentoresselected = contentores"
              >
                <v-icon dark>mdi-checkbox-multiple-blank-outline</v-icon>
              </v-btn>
              <v-btn
                v-else
                class="mx-2"
                fab
                dark
                small
                color="rgb(52, 122, 141)"
                @click="contentoresselected = []"
              >
                <v-icon dark>mdi-checkbox-multiple-marked</v-icon>
              </v-btn>
              Contentores
              <v-spacer></v-spacer>
              <v-text-field
                v-model="pesquisaContentor"
                clearable
                flat
                solo-inverted
                hide-details
                prepend-inner-icon="mdi-search"
                label="Pesquisar"
              ></v-text-field>
              <v-btn
                v-if="permissao()"
                class="mx-2"
                fab
                dark
                small
                color="rgb(52, 122, 141)"
                @click="
                  selecionado = {};
                  addContentor = true;
                "
              >
                <v-icon dark>mdi-plus</v-icon>
              </v-btn>
            </v-card-title>
            <v-data-table
              style="height: 800px"
              dark
              v-model="contentoresselected"
              :headers="contentorHeader"
              :items="contentores"
              :search="pesquisaContentor"
              :single-select="false"
              item-key="id"
              show-select
              class="elevation-1"
              :footer-props="{
                'items-per-page-options': [8],
              }"
              :items-per-page="8"
            >
              <template v-slot:[`item.nivel`]="{ item }">
                <v-chip
                  v-if="item.sensor"
                  :color="getColorNivelSensorTabela(item.nivel)"
                  dark
                  >{{ item.nivel }}%</v-chip
                >
                <v-icon title="Sem sensor" color="grey" dark v-if="!item.sensor"
                  >mdi-wifi</v-icon
                >
              </template>

              <template v-slot:[`item.status`]="{ item }">
                <v-icon
                  v-if="item.status"
                  title="Contentor Ativo"
                  color="green"
                >
                  mdi-toggle-switch
                </v-icon>

                <v-icon
                  v-if="!item.status"
                  title="Contentor Inativo"
                  color="grey"
                  dark
                >
                  mdi-toggle-switch-off
                </v-icon>
              </template>
              <template v-slot:[`item.editar`]="{ item }">
                <v-btn
                  v-if="permissao()"
                  class="mx-2"
                  fab
                  dark
                  small
                  color="rgb(52, 122, 141)"
                  @click="editarContentor(item)"
                >
                  <v-icon dark>mdi-pencil</v-icon>
                </v-btn>
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
            </v-data-table>
          </v-card>
        </v-col>
        <v-col :cols="5">
          <v-card style="height: 820px; width: 100%" dark>
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
              <template v-if="caminhoes">
                <l-marker
                  v-for="marker in caminhoes"
                  :key="`camioes-${marker.id}`"
                  :lat-lng="getlatLng(marker.lat, marker.lng)"
                >
                  <l-icon
                    :icon-size="dynamicSizeCamiao"
                    :icon-anchor="dynamicAnchorCamiao"
                    :icon-url="'https://vitrus-admin.nips.pt/img/caminhao/normal.png'"
                  />
                  <l-popup>
                    <div v-if="marker.data_cartrack">
                      Caminhao: {{ marker.matricula }}
                      <br />
                      Última Atualização:
                      {{
                        marker.data_cartrack.split("-")[2].substr(0, 2) +
                        "/" +
                        marker.data_cartrack.split("-")[1] +
                        "/" +
                        marker.data_cartrack.split("-")[0] +
                        " " +
                        marker.data_cartrack.split("-")[2].substr(2, 9)
                      }}
                      <br />
                      <p>
                        <br />
                      </p>
                    </div>
                  </l-popup>
                </l-marker>
              </template>
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
              <l-marker
                v-for="(marker, i) in contentoresselected"
                :key="`contentors-${i}`"
                :visible="marker.position != null"
                :draggable="marker.draggable"
                :lat-lng.sync="marker.position"
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
                <l-popup>
                  <div>
                    Contentor: {{ marker.numero_contentor }}
                    <br />
                    <v-chip
                      :color="getColorNivelSensorTabela(marker.nivel)"
                      dark
                      small
                      >{{ marker.nivel }}%</v-chip
                    >
                    <p>
                      Rua: {{ marker.rua }}
                      <br />
                      Freguesia: {{ marker.freguesia }}
                      <br />
                    </p>
                  </div>
                </l-popup>
              </l-marker>
            </l-map>
          </v-card>
        </v-col>

        <v-col key="caminhoes" :cols="2">
          <v-card v-if="caminhoes" dark>
            <v-card-title>
              Camiões
              <v-spacer></v-spacer>

              <v-menu
                ref="menuDataRota"
                v-model="menuDataRota"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
                style="z-index: 9999"
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    color="rgb(52, 122, 141)"
                    small
                    @blur="dataPercurso = parseDate(dateFormatted)"
                    v-on="on"
                    >Data da Rota:
                    {{
                      dataPercurso.split("-")[2] +
                      "/" +
                      dataPercurso.split("-")[1] +
                      "/" +
                      dataPercurso.split("-")[0]
                    }}</v-btn
                  >
                </template>
                <v-date-picker
                  v-model="dataPercurso"
                  min="2020-01-01"
                  :max="
                    new Date().getFullYear() +
                    '-' +
                    (new Date().getMonth() + 1) +
                    '-' +
                    new Date().getDay()
                  "
                  no-title
                  @input="menuDataRota = false"
                ></v-date-picker>
              </v-menu>
            </v-card-title>
            <v-data-table
              style="height: 790px"
              :headers="caminhaoHeader"
              :items="caminhoes"
              class="elevation-1"
              :footer-props="{
                'items-per-page-options': [12],
              }"
              :items-per-page="12"
              dark
            >
              <template v-slot:[`item.matricula`]="{ item }">
                {{ item.matricula }} {{ item.modelo }}
              </template>
              <template v-slot:[`item.position`]="{ item }">
                <v-btn
                  class="mx-2"
                  fab
                  dark
                  small
                  color="rgb(52, 122, 141)"
                  @click="getCarTrack(item.id_cartrack)"
                >
                  <v-icon dark>mdi-magnify-plus</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
      <v-row dense
        ><!--
        <v-col key="Histórico" :cols="12">
          <v-card v-if="historico" dark>
            <v-card-title>Histórico dos Reports </v-card-title>
            <v-data-table
              :headers="historicoHeader"
              :items="historico"
              :search="search"
              item-key="id"
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
                  title="Tem lixo grosso"
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
        </v-col> -->
      </v-row>
    </v-container>

    <div class="text-center">
      <v-dialog v-model="addContentor" style="z-index: 9999" width="500">
        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title
            >Contentor</v-card-title
          >
          <v-card-text>
            <v-form ref="form">
              <v-text-field
                v-model="selecionado.numero_contentor"
                :counter="10"
                label="Nº Contentor"
                required
              ></v-text-field>
              <v-text-field
                v-model="selecionado.rua"
                :counter="60"
                label="Rua"
                required
              ></v-text-field>
              <v-text-field
                v-model="selecionado.referencia"
                :counter="40"
                label="Refêrencia"
                required
              ></v-text-field>
              <v-text-field
                v-model="selecionado.freguesia"
                :counter="60"
                label="Freguesia"
                required
              ></v-text-field>
              <v-text-field
                v-model="selecionado.lat"
                :counter="15"
                label="Latitude"
                required
              ></v-text-field>
              <v-text-field
                v-model="selecionado.lng"
                :counter="15"
                label="Longitude"
                required
              ></v-text-field>
              <v-switch
                v-model="selecionado.status"
                :label="`${
                  selecionado.status
                    ? 'Desativar contentor'
                    : 'Ativar contentor'
                }`"
              ></v-switch>
              <v-btn color="success" class="mr-4" @click="saveContentor()"
                >Salvar</v-btn
              >

              <v-btn color="error" class="mr-4" @click="addContentor = false"
                >Cancelar</v-btn
              >
            </v-form>
          </v-card-text>

          <v-divider></v-divider>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import { icon, latLng } from "leaflet";
/* eslint-disable vue/no-unused-components */
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
  name: "Login",

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
    menuDataRota: "",
    pesquisaContentor: "",
    meses: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    pagination: {
      descending: true,
      page: 1,
      rowsPerPage: 10,
      totalItems: 0,
      rowsPerPageItems: [10],
    },
    addContentor: false,
    toneladaAno: 0,
    toneladaMes: 0,
    dataPercurso: new Date().toISOString().substr(0, 10),
    dateFormatted: new Date(),
    myStyle: {
      weight: 2,
      color: "rgb(142, 140, 140)",
      fillColor: "#5f5f5f",
    },
    rotas: [],
    cartrack: [],
    search: "",
    rotasHeader: [{ text: "Nome", value: "nome" }],
    rotasselected: [],
    historicoHeader: [
      { text: "Id", value: "id" },
      { text: "Contentor", value: "contentor" },
      { text: "Sensor", value: "sensor" },
      { text: "Data", value: "data" },
      { text: "Reports", value: "report" },
      { text: "Rua", value: "rua" },
      { text: "Rota", value: "rota" },
      { text: "Caminhão", value: "caminhao" },
      { text: "Motorista", value: "motorista" },
      { text: "Ultimo Nivel", value: "nivel" },
      { text: "Fotos", value: "fotos" },
      { text: "Mapa ", value: "position", sortable: false },
    ],
    contentorHeader: [
      { text: "Nº", value: "numero_contentor" },
      { text: "Rua", value: "rua" },
      { text: "Freguesia", value: "freguesia" },
      { text: "Nível (%)", value: "nivel" },
      { text: "Status ", value: "status", sortable: true },
      { text: "Mapa ", value: "position", sortable: false },
      { text: "editar", value: "editar", sortable: true },
    ],
    caminhaoHeader: [
      { text: "Matricula", value: "matricula" },
      { text: "Mapa ", value: "position", sortable: false },
    ],
    contentoresselect: false,
    contentoresselected: [],
    contentores: [],
    // historico: [],
    reports: {},
    selecionado: {},
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
    iconSize: 17,
    iconSizeCamiao: 30,
  }),
  watch: {
    date() {
      this.dataPercurso = this.formatDate(this.date);
    },
  },
  methods: {
    saveContentor() {
      if (this.selecionado.id)
        this.$http
          .put("contentors/" + this.selecionado.id, this.selecionado, {
            headers: {
              Authorization: `Bearer ${this.getObjeto("token")}`,
            },
          })
          .then(() => {
            this.getContentors();
          })
          .catch(() => {});
      else
        this.$http
          .post("contentors/", this.selecionado, {
            headers: {
              Authorization: `Bearer ${this.getObjeto("token")}`,
            },
          })
          .then(() => {
            this.getContentors();
          })
          .catch(() => {});
      this.selecionado = {};
      this.contentor = {};
      this.addContentor = false;
    },
    editarContentor(item) {
      this.selecionado = item;
      this.addContentor = true;
    },
    getToneladasResinorte() {
      this.toneladaAno = 0;
      this.toneladaMes = 0;

      this.$http
        .get("kms?tipo=descarga", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((response) => {
          response.data.forEach((item) => {
            if (
              new Date(item.data_registro).getFullYear() ==
              new Date().getFullYear()
            ) {
              this.toneladaAno += item.quantidade * 1;
              if (
                new Date(item.data_registro).getMonth() == new Date().getMonth()
              ) {
                this.toneladaMes += item.quantidade * 1;
              }
            }
            // this.toneladasResinorte += item.quantidade*1;
          });
        });
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${month}/${day}/${year}`;
    },
    parseDate(date) {
      if (!date) return null;

      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    getObjeto(nome) {
      return localStorage.getItem(nome)
        ? JSON.parse(localStorage.getItem(nome))
        : null;
    },
    setObjeto(nome, objeto) {
      return localStorage.setItem(nome, JSON.stringify(objeto));
    },
    imagemFoto(imagem) {
      return `https://vitrus-admin.nips.pt${imagem}`;
    },
    getColorNivelSensorTabela(nivel) {
      if (nivel > 74) return "#f24747";
      else if (nivel > 49) return "#fa8748";
      else if (nivel > 24) return "#ccc800";
      else return "#3a983e";
    },

    getColorNivelSensor(nivel) {
      if (nivel > 75) return "red";
      else if (nivel > 55) return "orange";
      else if (nivel) return "green";
      else return "white";
    } /*
    getReports() {
      this.$http
        .get("reports?_limit=100&_sort=data:DESC", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((response) => {
          this.historico = [];
          this.reports = response.data;
          response.data.forEach((i) => {
            this.historico.push({
              id: i.id,
              sensor: i.contentor.sensor ? true : false,
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
        });
    },*/,
    permissao() {
      return this.getObjeto("user").role.name == "Administrador";
    },
    getCaminhoes() {
      this.$http
        .get("camioes", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((response) => {
          this.caminhoes = response.data;
        });
    },
    getRota() {
      this.$http
        .get("rotas", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((response) => {
          this.rotas = response.data;
        });
    },
    getCarTrack(id) {
      this.$http
        .get("arcgis/camioes/" + id + "/" + this.dataPercurso, {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((response) => {
          this.cartrack = response.data;
          // this.centerZoom(this.center);
        })
        .catch(() => {
          // handle error

          this.cartrack = undefined;
          this.centerZoom(this.center);
        });
    },
    error401logout(error) {
      if (error.status == 401) {
        this.dialog = false;
        localStorage.clear();
        this.$router.push("/login");
      }
    },
   /*  getContentors() {
      this.contentores = [];
      this.$http
        .get("contentors?_limit=10000", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((response) => {
          response.data.forEach((i) => {
            i.position = latLng(i.lat, i.lng);

            this.contentores.push(i);
            this.center = this.contentores[0].position;
            this.contentoresselected = this.contentores;
          });
        })
        .catch((error) => {
          this.error401logout(error.response);
        });
    }, */
  },

  created() {
    this.getToneladasResinorte();
    this.getRota();
    //this.getReports();
    this.getCaminhoes();
    // this.timer = setInterval(this.getReports, 60000);
    this.timer = setInterval(this.getCaminhoes, 1000 * 60 * 2); //atualiza a cada 2 min
    this.$http
      .get("https://vitrus-admin.nips.pt/guimaraes.geojson")
      .then((response) => {
        this.geojson = response.data;
      });
    this.getContentors();
  },
  mounted() {
    setTimeout(function () {
      window.dispatchEvent(new Event("resize"));
    }, 500);

    const map = this.$refs.mymap.mapObject;

    map.addControl(new L.Control.Fullscreen());
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
};
</script>
<style scoped>
thead tr {
  background-color: #303030;
}

.v-data-table-header {
  background-color: #303030;
}
.v-data-footer__select {
  min-width: 3em;
  display: none;
}
</style>
<style>
.v-data-footer__select {
  min-width: 3em;
  display: none;
}
</style>
