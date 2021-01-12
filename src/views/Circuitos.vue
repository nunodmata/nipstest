<template>
  <div>
    <v-container fluid>
      <v-row dense>
        <v-col key="somaLitros" :cols="2">
          <v-card dark>
            <v-card-title>
              Total Litros :
              <v-spacer></v-spacer>
            </v-card-title>
            <center>
              <h1>{{ combustiveisTotal }}</h1>
            </center>
          </v-card>
          <v-card dark>
            <v-card-title>
              Média abast. por litros :
              <v-spacer></v-spacer>
            </v-card-title>
            <center>
              <h1>{{ combustiveisTotal / combustiveis.length }}</h1>
            </center>
          </v-card>
        </v-col>
        <v-col key="hstCamiao" :cols="4">
          <v-card v-if="camioes" dark>
            <v-card-title>Camiões</v-card-title>
            <v-data-table
              v-model="camioesselected"
              :headers="camiaoHeader"
              :items="camioes"
              :single-select="false"
              show-select
              dark
            ></v-data-table>
          </v-card>
        </v-col>
        <v-col key="hstAbastecimento" :cols="6">
          <v-card v-if="combustiveis" dark>
            <v-card-title>Histórico de Combustíveis</v-card-title>
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
                  :max="
                    new Date().getFullYear() +
                    '-' +
                    (new Date().getMonth() + 1) +
                    '-' +
                    new Date().getDay()
                  "
                  no-title
                  @input="menuDataFim = false"
                ></v-date-picker>
              </v-menu>
            </v-card-title>
            <v-card-title></v-card-title>
            <v-data-table
              :headers="combustiveisHeader"
              :items="combustiveis"
              dark
            ></v-data-table>
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
  LTooltip,
  LGeoJson,
  LIcon,
  LPolyline,
} from "vue2-leaflet";

export default {
  name: "Report",

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
    myStyle: {
      weight: 2,
      color: "rgb(142, 140, 140)",
      fillColor: "#5f5f5f",
    },
    camiaoHeader: [
      { text: "Matrícula", value: "matricula" },
      { text: "Modelo", value: "modelo" },
    ],
    camioesselected: [],
    camioes: [],
    combustiveisHeader: [
      { text: "Id", value: "id" },
      { text: "Matrícula", value: "matricula" },
      { text: "Km", value: "km" },
      { text: "Litros", value: "litros" },
      { text: "Data", value: "data" },
    ],
    dataInicio: new Date("01/01/2000").toISOString().substr(0, 10),
    dataFim: new Date().toISOString().substr(0, 10),
    dateFormatted: new Date(),
    menuDataInicio: false,
    menuDataFim: false,
    combustiveis: [],
    combustiveisRoot: [],
    combustiveisTotal: [],
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
    getCombustiveis() {
      this.$http
        .get("camioes", {
          headers: { Authorization: `Bearer ${this.getObjeto("token")}` },
        })
        .then((response) => {
          var camioes = response.data;

          this.$http
            .get("kms?tipo=posto", {
              headers: {
                Authorization: `Bearer ${this.getObjeto("token")}`,
              },
            })
            .then((response) => {
              var kms = response.data;
              kms.forEach((k) => {
                // console.log(k);
                this.camioes = camioes;
                this.camioesselected = this.camioes;
                camioes.forEach((c) => {
                  if (
                    k.historicocircuito !== null &&
                    k.historicocircuito.caminhao == c.id
                  ) {
                    k.camiao = c.camiao;
                    this.combustiveis.push({
                      id: k.id,
                      matricula: c.matricula,
                      km: k.km,
                      litros: k.quantidade,
                      camiao: c,
                      data: new Date(
                        k.data_registro.toString()
                      ).toLocaleString(),
                      data_registro: k.data_registro,
                    });
                    this.combustiveisRoot = this.combustiveis;
                  }
                });
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
    filtro() {
      this.combustiveis = [];
      this.combustiveisTotal = 0;
      this.camioesselected.forEach((v) => {
        this.combustiveisRoot.forEach((cr) => {
          if (
            v.matricula == cr.matricula &&
            this.dataInicio < cr.data_registro &&
            this.dataFim > cr.data_registro
          ) {
            console.log(cr.data);
            this.combustiveis.push(cr);
            this.combustiveisTotal += cr.litros;
          }
        });
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
    this.getCombustiveis();
  },
  watch: {
    camioesselected: function (val) {
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