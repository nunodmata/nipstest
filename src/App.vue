
<template >
  <div>
    <v-app id="inspire" v-if="$route.path != '/login'">
      <v-navigation-drawer dark v-model="drawer" app>
        <br />
        <br />
        <v-list dense>
          <v-list-item @click="navegar('/')">
            <v-list-item-action>
              <v-icon>mdi-home</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Home</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="navegar('/reportRealTime')">
            <v-list-item-action>
              <v-icon>mdi-history</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Histórico de Reports </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="navegar('camiao')">
            <v-list-item-action>
              <v-icon>mdi-gas-station</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Relatório de Combustível</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="navegar('report')">
            <v-list-item-action>
              <v-icon>mdi-clipboard-list-outline</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Relatório por Rota</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="navegar('reportDiario')">
            <v-list-item-action>
              <v-icon>mdi-clipboard-list-outline</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Relatório de Reports</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="navegar('insertCircuitos')">
            <v-list-item-action>
              <v-icon>mdi-map-plus</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Adicionar Rotas</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="permissao()" @click="navegar('utilizador')">
            <v-list-item-action>
              <v-icon>mdi-account</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Utilizadores</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar app dark style="z-index: 9995">
        <!--
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />  
        -->
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title>
          <img style="max-width: 80px; padding-top: 8px" src="img/logo.png" />
        </v-toolbar-title>
        <div
          class="d-flex justify-md-center padding-top: 8px;"
          style="padding-left: 30%; color: #00b3ad"
          outlined
        >
          <h3 style="padding-right: 10px">SMART COLLECTION</h3>
          <img style="max-height: 30px; padding-top: 4px" src="img/logo2.png" />
        </div>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-btn icon @click.stop="dialog = true">
          <v-icon>mdi-logout-variant</v-icon>
        </v-btn>
      </v-app-bar>
      <v-spacer></v-spacer>
      <v-main style="background: black">
        <v-container fluid>
          <router-view></router-view>
        </v-container>
        <v-dialog v-model="dialog" max-width="290" style="z-index: 9999">
          <v-card>
            <v-card-title class="headline">Deseja sair?</v-card-title>

            <v-card-text></v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn color="green darken-1" text @click="dialog = false"
                >Não</v-btn
              >

              <v-btn color="green darken-1" text @click="logout()">Sim</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-main>
      <v-footer dark app>
        <span class="white--text" style="padding-right: 5px">&copy; 2020</span>
        <img style="max-height: 25px; padding-top: 4px" src="img/logo2.png" />
      </v-footer>
    </v-app>
    <router-view v-if="$route.path == '/login'"></router-view>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import Vue from "vue";
import axios from "axios";

export const contentores = [];

export default Vue.extend({
  name: "App",
  props: {
    source: String,
  },

  data: () => ({
    fullscreen: false,
    titulo: "NipsTechnologie.pt",
    dialog: false,
    timer: "",
    gps: {},
    drawer: false,
    drawerRight: null,
    right: false,
    left: false,
    //
  }),
  watch: {},
  created() {
    if (this.$route.path != "/login") {
      if (!this.getObjeto("token")) {
        localStorage.clear();
        this.$router.push("/login");
      }
    }
  },
  methods: {
    permissao() {
      return this.getObjeto("user").role.name == "Administrador";
    },
    logout() {
      this.dialog = false;
      localStorage.clear();
      this.$router.push("/login");
    },
    navegar(navegar) {
      this.$router.push(navegar);
    },
    getObjeto(nome) {
      return localStorage.getItem(nome)
        ? JSON.parse(localStorage.getItem(nome))
        : null;
    },
    setObjeto(nome, objeto) {
      return localStorage.setItem(nome, JSON.stringify(objeto));
    },
  },
});
</script>


<style scoped>
.v-content {
  background-color: black;
}
.v-data-table-header {
  background-color: #303030;
}

thead tr {
  background-color: #303030;
}
</style>