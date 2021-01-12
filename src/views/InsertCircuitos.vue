<template>
  <div>
    <v-container fluid>
      <v-row dense>
        <v-col key="Histórico" :cols="6">
          <br><br>
          <v-card v-if="circuitos" style="height: 645px; width: 100%" dark>
            <v-card-title>
              Circuitos
              <v-btn
                class="mx-2"
                fab
                dark
                small
                color="rgb(52, 122, 141)"
                @click="
                  selecionadoLimpar();
                  dialog = true;
                "
              >
                <v-icon dark>mdi-plus</v-icon>
              </v-btn>
            </v-card-title>
            <v-data-table
              :headers="hstCircuitosHeader"
              :items="circuitos"
              :search="search"
              dark
            >
              <template v-slot:[`item.dataCriacao`]="{ item }">
                {{
                  item.dataCriacao
                    ? new Date(item.dataCriacao).toLocaleString()
                    : ""
                }}
              </template>
              <template v-slot:[`item.dataTermino`]="{ item }">
                {{
                  item.dataTermino
                    ? new Date(item.dataTermino).toLocaleString()
                    : ""
                }}
              </template>
              <template v-slot:[`item.tipo`]="{ item }">
                {{ item.tipo.tipo }}
              </template>

              <template v-slot:[`item.tipo_circuito`]="{ item }">
                {{ item.tipo_circuito.circuito }}
              </template>

              <template v-slot:[`item.Contentors`]="{ item }">
                {{ item.Contentors.length }}
              </template>
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
              <template v-slot:[`item.editar`]="{ item }">
                <v-btn
                  class="mx-2"
                  fab
                  dark
                  small
                  color="rgb(52, 122, 141)"
                  @click="editarRota(item)"
                >
                  <v-icon dark>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col :cols="6">
          <br><br>
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
              {{ selecionado.Contentors }}
              <template v-if="selecionado">
                <l-marker
                  id="marker.id"
                  v-for="marker in selecionado.Contentors"
                  :key="marker.id"
                  :visible="marker.position"
                  :draggable="marker.draggable"
                  :lat-lng="
                    getlatLng(
                      marker.contentor ? marker.contentor.lat : 0,
                      marker.contentor ? marker.contentor.lng : 0
                    )
                  "
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
              <l-marker
                :lat-lng="getlatLng(41.38150949313275, -8.380767029624579)"
              >
                <l-icon
                  :icon-size="dynamicSize"
                  :icon-anchor="dynamicAnchor"
                  :icon-url="'https://vitrus-admin.nips.pt/img/resinorte.png'"
                />
                <l-popup>
                  <div>Resinorte</div>
                </l-popup>
              </l-marker>

              <l-geo-json
                v-if="geojson"
                :geojson="geojson"
                :options-style="myStyle"
              ></l-geo-json>
              <l-tile-layer :url="url" :attribution="attribution" />
            </l-map>
          </v-card>
        </v-col>
      </v-row>
      <div class="text-center">
        <v-dialog v-model="dialog" style="z-index: 9999" width="500">
          <v-card>
            <v-card-title class="headline grey lighten-2" primary-title
              >Rota dos Contentores</v-card-title
            >
            <v-card-text>
              <v-form ref="form">
                <v-text-field
                  v-model="selecionado.nome"
                  :counter="40"
                  label="Name referência"
                  required
                ></v-text-field>
                <v-select
                  v-model="selecionado.tipo_circuito"
                  :items="tipoCircuitos"
                  item-text="circuito"
                  label="Circuitos"
                  return-object
                  required
                ></v-select>
                <v-select
                  v-model="selecionado.diaDaSemana"
                  :items="semana"
                  item-value="id"
                  item-text="dia"
                  label="Dia da Semana"
                  required
                ></v-select>
                <v-select
                  v-model="selecionado.tipo"
                  :items="tipo"
                  item-text="tipo"
                  label="Tipo"
                  return-object
                  required
                ></v-select>
                <draggable :list="selecionado.Contentors">
                  <template>
                    <v-list-item
                      v-for="item in selecionado.Contentors"
                      :key="item.contentor.id"
                    >
                      <template v-slot:default="{ active, toggle }">
                        <v-list-item-content v-if="!item.endereco">
                          <v-list-item-subtitle class="text--primary"
                            >{{ item.contentor.numero_contentor }} -
                            {{
                              item.contentor.rua +
                              " - " +
                              item.contentor.freguesia
                            }}</v-list-item-subtitle
                          >
                          <v-list-item-subtitle>{{
                            item.contentor.referencia
                          }}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-content v-else>
                          <v-list-item-subtitle class="text--primary"
                            >{{ item.endereco }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-text-field
                          v-if="openOBS == item.contentor.id"
                          v-model="item.obs"
                          :counter="40"
                          label="Observação"
                        ></v-text-field>
                        <v-list-item-action
                          @click="
                            openOBS =
                              openOBS == item.contentor.id
                                ? 0
                                : item.contentor.id
                          "
                        >
                          <v-icon color="blue"
                            >{{
                              item.obs == null || item.obs.length == 0
                                ? "mdi-information-outline"
                                : "mdi-information"
                            }}
                          </v-icon>
                        </v-list-item-action>
                        <v-list-item-action @click="removeContentor(item)">
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-list-item-action>
                      </template>

                      <v-divider></v-divider>
                    </v-list-item>
                  </template>
                </draggable>
                <v-autocomplete
                  v-model="contentor"
                  :items="contentors"
                  item-text="autocomplete"
                  label="Contentores"
                  class="mr-4"
                  return-object
                  required
                ></v-autocomplete>

                <v-btn
                  :disabled="contentor.numero_contentor == null"
                  color="success"
                  class="mr-4"
                  @click="addContentor()"
                  >Adicionar
                </v-btn>

                <v-btn color="success" class="mr-4" @click="saveRota()"
                  >Salvar</v-btn
                >

                <v-btn color="error" class="mr-4" @click="dialog = false"
                  >Cancelar</v-btn
                >
              </v-form>
            </v-card-text>

            <v-divider></v-divider>
          </v-card>
        </v-dialog>
      </div>
    </v-container>
  </div>
</template>

<script>
import { icon, latLng } from "leaflet";
import draggable from "vuedraggable";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LGeoJson,
  LIcon,
} from "vue2-leaflet";

export default {
  name: "Report",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LGeoJson,
    LIcon,
    draggable,
  },
  data: () => ({
    tipoCircuitos: [],
    openOBS: 0,
    semana: [
      { id: 0, dia: "Domingo" },
      { id: 1, dia: "Segunda-Feira" },
      { id: 2, dia: "Terça-Feira" },
      { id: 3, dia: "Quarta-Feira" },
      { id: 4, dia: "Quinta-Feira" },
      { id: 5, dia: "Sexta-Feira" },
      { id: 6, dia: "Sábado" },
    ],
    contentors: [],
    contentor: {},
    endereco: "",
    dialog: false,
    myStyle: {
      weight: 2,
      color: "rgb(142, 140, 140)",
      fillColor: "#5f5f5f",
    },
    hstCircuitosHeader: [
      { text: "Nome", value: "nome" },
      { text: "Tipo", value: "tipo" },
      { text: "Circuito", value: "tipo_circuito" },
      { text: "Nº Contentores", value: "Contentors" },
      { text: "Visualizar", value: "id", sortable: true },

      { text: "editar", value: "editar", sortable: true },
    ],
    circuitos: [],

    search: "",
    tipo: [],
    selecionado: { tipo: 2 },
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
    removeContentor(obj) {
      if (
        confirm(
          "Você deseja deletar o contentor " +
            obj.contentor.numero_contentor +
            "?"
        )
      )
        this.selecionado.Contentors = this.selecionado.Contentors.filter(
          (item) => item !== obj
        );
    },
    addContentor() {
      if (!this.selecionado.Contentors) this.selecionado.Contentors = [];
      this.selecionado.Contentors.push({ contentor: this.contentor });

      this.contentor = {};
    },
    addEndereco() {
      if (!this.selecionado.Contentors) this.selecionado.Contentors = [];
      this.selecionado.Contentors.push({
        endereco: this.endereco,
        contentor: {},
      });

      this.endereco = "";
    },
    saveRota() {
      if (this.selecionado.id)
        this.$http
          .put("rotas/" + this.selecionado.id, this.selecionado, {
            headers: {
              Authorization: `Bearer ${this.getObjeto("token")}`,
            },
          })
          .then(() => {
            this.getRotas();
            //console.log("salvou");
          });
      else {
        this.selecionado.dataCriacao = new Date();
        this.$http
          .post("rotas/", this.selecionado, {
            headers: {
              Authorization: `Bearer ${this.getObjeto("token")}`,
            },
          })
          .then(() => {
            this.getRotas();
            //console.log("salvou");
          });
      }
      this.selecionado = {};
      this.contentor = {};
      this.dialog = false;
    },
    getColorNivelSensorTabela(nivel) {
      if (nivel > 75) return "#f24747";
      else if (nivel > 55) return "#fa8748";
      else if (nivel) return "#3a983e";
      else return "white";
    },
    editarRota(item) {
      this.selecionadoLimpar();
      this.selecionado = item;
      this.dialog = true;
    },
    selecionadoLimpar() {
      this.selecionado = { tipo: 3 };
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
    pesquisarCircuito(item) {
      this.selecionado = item;
    },
    getListas() {
      this.$http
        .get("tipo-circuitos", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((tipo) => {
          this.tipoCircuitos = tipo.data;
        });

      this.$http
        .get("tipoRotas", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((tipoRotas) => {
          this.tipo = tipoRotas.data;
        });
      this.$http
        .get("contentors?_limit=50000&status=true", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((contentors) => {
          this.contentors = contentors.data;
          this.contentors.forEach((item) => {
            item.autocomplete =
              item.numero_contentor +
              " - " +
              item.rua +
              " - " +
              (item.referencia ? item.referencia + " - " : "") +
              item.freguesia;
          });
        });
      this.getRotas();
    },
    getRotas() {
      this.$http
        .get("rotas", {
          headers: {
            Authorization: `Bearer ${this.getObjeto("token")}`,
          },
        })
        .then((responseRotas) => {
          this.circuitos = responseRotas.data;
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
    this.getListas();

    this.$http
      .get("https://vitrus-admin.nips.pt/guimaraes.geojson")
      .then((response) => {
        this.geojson = response.data;
      });
  },
};
</script>