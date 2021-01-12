<template>
  <div>
    <v-container fluid>
      <v-row dense>
        <v-col key="somaLitros" :cols="2">
          <v-card dark>
          
            <v-card-title>
              Total abastecido (Litros):
              <v-spacer></v-spacer>
            </v-card-title>
            <center>
              <h1>{{ (combustiveisTotal * 1).toLocaleString("pt-PT") }}</h1>
            </center>
          </v-card>
        </v-col>
        <v-col key="mediaLitros" :cols="3">
          
          <v-card dark>
            <v-card-title>
              Média por abastecimento (Litros):
              <v-spacer></v-spacer>
            </v-card-title>
            <center>
              <h1>
                {{
                  combustiveis.length == 0
                    ? 0
                    : (
                        combustiveisTotal /
                        (combustiveis ? combustiveis.length : 0)
                      ).toLocaleString("pt-PT")
                }}
              </h1>
            </center>
          </v-card>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col key="hstCamiao" :cols="5">
          <v-card v-if="camioes" dark>
            <v-card-title>
              Camiões
              <v-spacer></v-spacer>
              <v-text-field
                v-model="pesquisaCamiao"
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
                  addCamiao = true;
                "
              >
                <v-icon dark>mdi-plus</v-icon>
              </v-btn>
            </v-card-title>
            <v-data-table
              v-model="camioesselected"
              :headers="camiaoHeader"
              :search="pesquisaCamiao"
              :items="camioes"
              :single-select="false"
              show-select
              dark
            >
              <template v-slot:[`item.editar`]="{ item }">
                <v-btn
                  v-if="permissao()"
                  class="mx-2"
                  fab
                  dark
                  small
                  color="rgb(52, 122, 141)"
                  @click="editarCamiao(item)"
                >
                  <v-icon dark>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
        <v-col key="hstAbastecimento" :cols="6">
          <v-card v-if="combustiveis" dark>
            <v-card-title>Histórico dos abastecimentos</v-card-title>
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
    <div class="text-center">
      <v-dialog v-model="addCamiao" style="z-index: 9999" width="500">
        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title
            >Camião</v-card-title
          >
          <v-card-text>
            <v-form ref="form">
              <v-text-field
                v-model="selecionado.nome"
                label="Nome referência"
              ></v-text-field>
              <v-text-field
                v-model="selecionado.matricula"
                label="Matrícula"
                required
              ></v-text-field>
              <v-text-field
                v-model="selecionado.modelo"
                label="Modelo"
                required
              ></v-text-field>
              <v-text-field
                v-model="selecionado.ano"
                label="Ano"
                required
              ></v-text-field>
              <v-text-field
                v-model="selecionado.fabricante"
                label="Fabricante"
                required
              ></v-text-field>
              <v-text-field
                v-model="selecionado.combustivel"
                label="Combustível"
                required
              ></v-text-field>

              <v-btn color="success" class="mr-4" @click="saveCamiao()"
                >Salvar</v-btn
              >

              <v-btn color="error" class="mr-4" @click="addCamiao = false"
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
export default {
  name: "Report",

  data: () => ({
    addCamiao: false,
    pesquisaCamiao: "",
    myStyle: {
      weight: 2,
      color: "rgb(142, 140, 140)",
      fillColor: "#5f5f5f",
    },
    camiaoHeader: [
      { text: "Matrícula", value: "matricula" },
      { text: "Modelo", value: "modelo" },

      { text: "editar", value: "editar", sortable: true },
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
    combustiveisTotal: 0,
    selecionado: false,
    caminhoes: [],
  }),
  methods: {
    editarCamiao(item) {
      this.selecionado = item;
      this.addCamiao = true;
    },
    saveCamiao() {
      if (this.selecionado.id)
        this.$http
          .put("camioes/" + this.selecionado.id, this.selecionado, {
            headers: {
              Authorization: `Bearer ${this.getObjeto("token")}`,
            },
          })
          .then(() => {
            this.getCombustiveis();
          })
          .catch(() => {});
      else
        this.$http
          .post("camioes/", this.selecionado, {
            headers: {
              Authorization: `Bearer ${this.getObjeto("token")}`,
            },
          })
          .then(() => {
            this.getCombustiveis();
          })
          .catch(() => {});
      this.selecionado = {};
      this.camiao = {};
      this.addCamiao = false;
    },
    permissao() {
      return this.getObjeto("user").role.name == "Administrador";
    },
    parseDate(date) {
      if (!date) return null;
      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    getCombustiveis() {
      this.camioesselected = [];
      this.combustiveis = [];
      this.combustiveisRoot = [];
      this.combustiveisTotal = 0;
      this.camioes = [];

      this.$http
        .get("camioes", {
          headers: { Authorization: `Bearer ${this.getObjeto("token")}` },
        })
        .then((response) => {
          var camioes = response.data;
          this.camioes = camioes;
          this.camioesselected = this.camioes;

          this.$http
            .get("kms?tipo=combustível", {
              headers: {
                Authorization: `Bearer ${this.getObjeto("token")}`,
              },
            })
            .then((response) => {
              var kms = response.data;
              kms.forEach((k) => {
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
                  }
                });
              });
              this.combustiveisRoot = this.combustiveis;
              this.filtro();
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
      var dataInicio = new Date(this.dataInicio);
      var dataFim = new Date(this.dataFim);
      this.camioesselected.forEach((v) => {
        this.combustiveisRoot.forEach((cr) => {
          if (
            v.matricula == cr.matricula &&
            dataInicio < new Date(cr.data_registro) &&
            dataFim.setDate(dataFim.getDate() + 1) > new Date(cr.data_registro)
          ) {
            this.combustiveis.push(cr);
            this.combustiveisTotal += cr.litros;
          }
        });
      });
    },
  },
  created() {
    this.getCombustiveis();
  },
  watch: {
    camioesselected: function () {
      this.filtro();
    },
    dataInicio: function () {
      this.filtro();
    },

    dataFim: function () {
      this.filtro();
    },
  },
};
</script>