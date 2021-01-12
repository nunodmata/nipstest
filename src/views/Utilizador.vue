<template>
  <div>
    <v-container fluid>
      <v-row dense>
        <v-col key="listUtilizadores" :cols="12">
          
          <v-card v-if="utilizadores" dark>
            <v-card-title>
              Utilizadores
              <v-spacer></v-spacer>
              <v-text-field
                v-model="pesquisaUtilizadores"
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
                @click="selecionado={};addUtilizador=true"
              >
                <v-icon dark>mdi-plus</v-icon>
              </v-btn>
            </v-card-title>
            <v-data-table
              v-model="utilizadorselected"
              :headers="utilizadorHeader"
              :search="pesquisaUtilizadores"
              :items="utilizadores"
              dark
            >
              <template v-slot:[`item.role`]="{ item }">{{item.role.name}}</template>
              <template v-slot:[`item.editar`]="{ item }">
                <v-btn
                  v-if="permissao()"
                  class="mx-2"
                  fab
                  dark
                  small
                  color="rgb(52, 122, 141)"
                  @click="editarUtilizador(item)"
                >
                  <v-icon dark>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <div class="text-center">
      <v-dialog v-model="addUtilizador" style="z-index:9999" width="500">
        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>Utilizador</v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-text-field v-model="selecionado.nome" label="Nome"></v-text-field>
              <v-text-field v-model="selecionado.apelido" label="Apelido" required></v-text-field>
              <v-text-field v-model="selecionado.cargo" label="Cargo" required></v-text-field>
              <v-text-field v-model="selecionado.username" label="Nº Utilizador" required></v-text-field>
              <v-text-field v-model="selecionado.email" label="Email" required></v-text-field>
              <v-select
                v-model="selecionado.permissao"
                :items="permissoes"
                label="Grupo de Permissões"
              ></v-select>
              <v-text-field
                v-model="selecionado.senha"
                :type="showPass ? 'text' : 'password'"
                label="Senha"
                required
                @click:append="showPass = !showPass"
                :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
              ></v-text-field>
              <v-btn color="success" class="mr-4" @click="saveUtilizador()">Salvar</v-btn>

              <v-btn color="error" class="mr-4" @click="addUtilizador = false">Cancelar</v-btn>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>
        </v-card>
      </v-dialog>
    </div>
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
    showPass: false,
    addUtilizador: false,
    utilizadorselected: [],
    utilizadores: [],
    pesquisaUtilizadores: "",
    selecionado: { role: { name: "" } },
    myStyle: {
      weight: 2,
      color: "rgb(142, 140, 140)",
      fillColor: "#5f5f5f",
    },
    permissoes: ["Administrador", "Motorista", "Dashboard"],
    utilizadorHeader: [
      { text: "Nome", value: "nome" },
      { text: "Apelido", value: "apelido" },
      { text: "Cargo", value: "cargo" },
      { text: "Nº Utilizador", value: "username" },
      { text: "Email", value: "email" },
      { text: "Permissão", value: "role" },
      { text: "editar", value: "editar", sortable: true },
    ],
  }),
  methods: {
    editarUtilizador(item) {
      this.selecionado = item;
      this.selecionado.permissao = item.role.name;
      this.addUtilizador = true;
    },
    saveUtilizador() {
      if (this.selecionado.permissao == "Administrador") {
        this.selecionado.role = { id: 1 };
      } else if (this.selecionado.permissao == "Motorista") {
        this.selecionado.role = { id: 3 };
      } else {
        this.selecionado.role = { id: 4 };
      }
      if (this.selecionado.senha.length > 0) {
        this.selecionado.password = this.selecionado.senha;
      }
      if (this.selecionado.id)
        this.$http
          .put("users/" + this.selecionado.id, this.selecionado, {
            headers: {
              Authorization: `Bearer ${this.getObjeto("token")}`,
            },
          })
          .then((response) => {
            console.log("salvou alteração");
            this.getUtilizadores();
          })
          .catch((error) => {});
      else
        this.$http
          .post("users/", this.selecionado, {
            headers: {
              Authorization: `Bearer ${this.getObjeto("token")}`,
            },
          })
          .then((response) => {
            this.getUtilizadores();
          })
          .catch((error) => {});
      this.selecionado = {};
      this.utilizador = {};
      this.addUtilizador = false;
    },
    permissao() {
      return this.getObjeto("user").role.name == "Administrador";
    },
    parseDate(date) {
      if (!date) return null;
      console.log(date);
      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    getUtilizadores() {
      console.log("passou aqui----------------------");
      this.$http
        .get("users", {
          headers: { Authorization: `Bearer ${this.getObjeto("token")}` },
        })
        .then((response) => {
          this.utilizadores = response.data;
        })
        .catch((error) => {
          console.log(error);
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
  created() {
    console.log("aqui");
    this.getUtilizadores();
  },
};
</script>