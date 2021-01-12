/* eslint-disable */
"use strict";
export default Plugin;


import Vue from 'vue'
import axios from 'axios'

//axios.defaults.baseURL = 'http://localhost:1337/'
// axios.defaults.headers.common['Authorization'] = 'abc123'
// axios.defaults.headers.get['Accepts'] = 'application/json'

Vue.use({
  install(Vue) {
    Vue.prototype.$http = axios.create({
      baseURL: '/',
      baseURL: 'https://vitrus-admin.nips.pt/',

    })
  }
})