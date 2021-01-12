<template>
  <div>
    <v-container fluid>
      <v-row dense>
        <v-col key="Histórico" :cols="12">
          <v-card dark>
            <v-card-title>Histórico dos Reports </v-card-title
            ><v-card-subtitle
              >Atualizado em:
              {{
                latestDate.toLocaleDateString("pt-PT") +
                " " +
                latestDate.toLocaleTimeString("pt-PT")
              }}</v-card-subtitle
            >
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
export default {
  name: "ReportsRealTime",

  data: () => ({
    historico: [],
    latestDate: new Date(),
    pagination: {
      descending: true,
      page: 1,
      rowsPerPage: 10,
      totalItems: 0,
      rowsPerPageItems: [10],
    },
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
      { text: "Camião", value: "caminhao" },
      { text: "Motorista", value: "motorista" },
      { text: "Último Nivel", value: "nivel" },
      { text: "Fotos", value: "fotos" },
    ],
    contentoresselect: false,
    contentoresselected: [],
    contentores: [],
    // historico: [],
    reports: {},
    selecionado: {},

    showParagraph: false,
    mapOptions: {
      zoomSnap: 0.5,
    },
    showMap: true,
    geojson: null,
    iconSize: 17,
    iconSizeCamiao: 30,
  }),
  watch: {},
  methods: {
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
    },
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
              position: "",
            });
          });

          this.latestDate = new Date();
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
    error401logout(error) {
      if (error.status == 401) {
        this.dialog = false;
        localStorage.clear();
        this.$router.push("/login");
      }
    },

    toISOFormat(dateTimeString) {
      // Primeiro, dividimos a data completa em duas partes:
      const [date, time] = dateTimeString.split(" ");

      // Dividimos a data em dia, mês e ano:
      const [DD, MM, YYYY] = date.split("/");

      // Dividimos o tempo em hora e minutos:
      const [HH, mm] = time.split(":");

      // Retornamos a data formatada em um padrão compatível com ISO:
      return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
    },
  },

  created() {
    this.getReports();
    this.timer = setInterval(this.getReports, 1000 * 60);
  },
  mounted() {},
  computed: {},
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
