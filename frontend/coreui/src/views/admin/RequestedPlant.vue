<template>
<div>
  <bounce-spinner v-if="isLoading"></bounce-spinner>
  <div class="animated fadeIn" v-if="isLoading==false">
    <b-card-group class="mb-4">
      <b-card>
        <div class="h1 text-muted text-right mb-4">
          <img src="img/avatars/gardener.png" width="50px" alt="Gardener Image">
        </div>
        <div class="h4 mb-0">{{farmerRegistered}}</div>
        <small class="text-muted text-uppercase font-weight-bold">Farmers Registered</small>
        <b-progress
          height="{}"
          class="progress-xs mt-3 mb-0"
          variant="info"
          :value="farmerRegistered"
        />
      </b-card>
      <b-card>
        <div class="h1 text-muted text-right mb-4">
          <img src="img/avatars/plant.png" width="50px" alt="Plant Image">
        </div>
        <div class="h4 mb-0">{{tanamanRegistered}}</div>
        <small class="text-muted text-uppercase font-weight-bold">Plants Registered</small>
        <b-progress
          height="{}"
          class="progress-xs mt-3 mb-0"
          variant="success"
          :value="tanamanRegistered"
        />
      </b-card>
    </b-card-group>
    <b-row>
      <b-col md="12">
        <b-card header="Requested Plants" class="card-accent-success">
          <b-table
            class="mb-0 table-outline"
            striped
            responsive="sm"
            hover
            :items="tableItems"
            :fields="tableFields"
            head-variant="light"
          >
            <div slot="key-nama" slot-scope="data">
              <strong>{{data.item.farmer_docs[0].nama}}</strong>
            </div>
            <div slot="key-nama-tanaman" slot-scope="data">
              <strong>{{data.item.namaTanaman}}</strong>
            </div>
            <div slot="key-spesies-tanaman" slot-scope="data">
              <strong>{{data.item.spesies}}</strong>
            </div>
            <div slot="key-id-raspi" slot-scope="data">
              <b-link class="card-header-action btn-minimize" v-b-toggle.collapse1>
                <h4><b-badge variant="success" v-bind:id="data.item._id" >Open ID <i class="icon-eye"></i></b-badge></h4>
              </b-link>
                <b-popover v-bind:target="data.item._id" title="Plant ID">
                <strong>{{data.item._id}}</strong>
              </b-popover>
            </div>
            <div slot="key-tanggal" slot-scope="data">
               <h5> <b-badge :variant="dateFormatter(data.item.perangkat.data[0].tanggal)">{{dateOnFormat}}</b-badge></h5> 
            </div>
            <div slot="key-alamat" slot-scope="data">
              <i class="icon-direction"></i>
              <strong> {{data.item.lokasiLahan}}</strong>
            </div>
            <div slot="key-telphone" slot-scope="data">
              <h5>
                <b-badge variant="success">{{data.item.luasLahan}} m x m </b-badge>
              </h5>
            </div>
          </b-table>
        </b-card>
      </b-col>
    </b-row>
  </div>
</div>
</template>

<script>
import CardLine1ChartExample from "../dashboard/CardLine1ChartExample";
import CardLine2ChartExample from "../dashboard/CardLine2ChartExample";
import CardLine3ChartExample from "../dashboard/CardLine3ChartExample";
import CardBarChartExample from "../dashboard/CardBarChartExample";
import MainChartExample from "../dashboard/MainChartExample";
import SocialBoxChartExample from "../dashboard/SocialBoxChartExample";
import CalloutChartExample from "../dashboard/CalloutChartExample";
import { Callout } from "@coreui/vue";
import PostsService from "@/services/PostsService";
import Constants from "@/services/Constants";
import 'vue-spinners/dist/vue-spinners.css';
import { BounceSpinner } from 'vue-spinners/dist/vue-spinners.common';


export default {
  name: "RequestedPlants",
  components: {
    Callout,
    BounceSpinner,
    CardLine1ChartExample,
    CardLine2ChartExample,
    CardLine3ChartExample,
    CardBarChartExample,
    MainChartExample,
    SocialBoxChartExample,
    CalloutChartExample
  },
  data: function() {
    return {
      isLoading: true,
      farmerRegistered: 0,
      tanamanRegistered: 0,
      deviceOnline: 0,
      deviceOffline: 0,
      devicePending: 0,
      dateOnFormat:"",
      selected: "Month",
      tableItems: [],
      tableFields: [
        {
          key: "key-nama",
          label: "Farmers"
        },
        {
          key: "key-nama-tanaman",
          label: "Plant Name"
        },
        {
          key: "key-spesies-tanaman",
          label: "Plant Spesies"
        },
        {
          key: "key-id-raspi",
          label: "ID Plant"
        },
        {
          key: "key-tanggal",
          label: "Date Request"
        },
        {
          key: "key-alamat",
          label: "Location"
        },
        {
          key: "key-telphone",
          label: "Large Area"
        }
      ]
    };
  },
  created() {
    this.checkSession();
  },
  methods: {
    async fetchDataFarmer() {
      let response = await PostsService.getAllFarmer(
        window.localStorage.getItem("token")
      );
      return response.data;
    },
    async fetchDataTanaman() {
      let response = await PostsService.getAllTanaman(
        window.localStorage.getItem("token")
      );
      return response.data;
    },
    async fetchDataRequestedTanaman() {
      let response = await PostsService.getRequestedTanaman(
        window.localStorage.getItem("token")
      );
      return response.data;
    },
    checkSession() {
      /**
       * check session and do action
       */
      if (!window.localStorage.getItem("token")) {
        this.$router.push({ name: "Login" });
      } else {
        if (window.localStorage.getItem("role") != Constants.ROLE_ADMIN) {
          // redirect to 404 page
          this.$router.push({ name: "Page404" });
        } else {
          this.firstLoad();
        }
      }
    },
    async firstLoad() {
      var active = 0,
        nonactive = 0,
        pending = 0;
      let response = await this.fetchDataFarmer();
      let responseDataTanaman = await this.fetchDataTanaman();
      let responseDataRequestedTanaman = await this.fetchDataRequestedTanaman();
      let farmerData = response.data;
      let tanamanData = responseDataTanaman.data;
      let requestedTanamanData = responseDataRequestedTanaman.data;
      this.isLoading=false
      this.farmerRegistered = farmerData.length;
      this.tanamanRegistered = tanamanData.length;
      for (var i = 0; i < tanamanData.length; i++) {
        switch (tanamanData[i].perangkat.status) {
          case Constants.DEVICE_ACTIVE:
            active++;
            break;
          case Constants.DEVICE_NONACTIVE:
            nonactive++;
            break;
          default:
            pending++;
        }
      }
      this.tableItems = requestedTanamanData;
      this.deviceOnline = active;
      this.deviceOffline = nonactive;
      this.devicePending = pending;
    },
    dateFormatter(date){
      var created_date = new Date(date);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = created_date.getFullYear();
      var month = months[created_date.getMonth()];
      var date = created_date.getDate();
      var hour = created_date.getHours();
      var min = created_date.getMinutes();
      var sec = created_date.getSeconds();
      var time = date + ',' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;    // final date with time, you can use this according your requirement
      this.dateOnFormat = time;
      return 'secondary';
    },
    variant(value) {
      let $variant;
      if (value <= 25) {
        $variant = "info";
      } else if (value > 25 && value <= 50) {
        $variant = "success";
      } else if (value > 50 && value <= 75) {
        $variant = "warning";
      } else if (value > 75 && value <= 100) {
        $variant = "danger";
      }
      return $variant;
    },
    flag(value) {
      return "flag-icon flag-icon-" + value;
    }
  }
};
</script>

<style>
/* IE fix */
#card-chart-01,
#card-chart-02 {
  width: 100% !important;
}
</style>
