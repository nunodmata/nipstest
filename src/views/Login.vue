<template>
  <v-app id="inspire">
    <v-main class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Smart Collection</v-toolbar-title>
              <v-spacer />
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-btn icon large href="#" target="_blank" v-on="on">
                    <v-icon>mdi-information-outline</v-icon>
                  </v-btn>
                </template>
                <span>Sobre</span>
              </v-tooltip>
            </v-toolbar>
            <v-card-text>
              <v-form>
                <v-text-field
                  label="Login"
                  name="login"
                  type="text"
                  v-model="user.identifier"
                />
                <v-text-field
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  v-model="user.password"
                />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="logar()">Login</v-btn>
            </v-card-actions>
            <v-alert type="error" v-if="error">{{ error }}</v-alert>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "Login",

  data: () => ({
    user: { identifier: "", password: "" },
    error: "",
  }),
  methods: {
    logar() {
      this.$http
        .post("auth/local", this.user)
        .then((response) => {
          if (
            response.data.user.role.name == "Administrador" ||
            response.data.user.role.name == "Visualizador"
          ) {
            // Handle success.
            this.setObjeto("user", response.data.user);
            this.setObjeto("token", response.data.jwt);
            this.error = "";
            this.acessar();
          } else {
            this.error = "Utilizador sem permissão.";
          }
        })
        .catch(() => {
          this.error = "Senha ou utilizador incorreto";
        });
    },
    acessar() {
      this.$router.push("/home");
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
  created() {},
};
</script>