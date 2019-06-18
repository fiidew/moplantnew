<template>
<div>
    <bounce-spinner v-if="isLoading"></bounce-spinner>
  <div class="animated fadeIn" v-if="isLoading==false">
  
    <b-row>
      <b-alert show variant="success" v-if="successAlert.length > 0">
              <h4 class="alert-heading">Congratulation !</h4>
              <ul>
                <li v-for="item in successAlert" :key="item">{{ item }}</li>
              </ul>
              
      </b-alert>
      <b-col sm="6" lg="6"> 
      </b-col>
      <b-col sm="6" lg="6">
      </b-col>
    </b-row>

    <b-row>
      <b-col md="12">
        <b-card header="Plant List" class="card-accent-success">
           <div slot="header">
              <b>Plant List</b>
              <div class="card-header-actions">
                <b-button type="button" variant="success" @click="showModal" class="mr-1">Register Plant</b-button>
             
              </div>
          </div>
          <b-row>        
             
          </b-row>
          <b-row>
            <b-table striped outlined stacked="sm" hover :items="tableItems" :fields="tableFields" head-variant="light"  v-if="existingData == true">
            <div slot="namaTanaman" slot-scope="data">
              <img src="img/plant/plant.png" width="50px" alt="plants logo">
              <strong>{{data.value}}</strong>
              <b-link class="card-header-action btn-minimize" v-b-toggle.collapse1>
                  <i v-bind:id="data.item._id" class="icon-eye"></i>
              </b-link>
              <b-popover v-bind:target="data.item._id" title="Plant ID">
                <strong>{{data.item._id}}</strong> 
                <h5><b-badge variant="secondary">{{data.item.perangkat.idOnRaspi}}</b-badge></h5>
              </b-popover>
              <!-- <div class="small text-muted">{{data.item._id}}</div> -->
            </div>
            <div slot="key-kondisi" slot-scope="data">
              <b-badge :variant="getKondisi(data.item.perangkat.data[data.item.perangkat.data.length-1].kondisi)">{{data.item.perangkat.data[data.item.perangkat.data.length-1].kondisi == 0 ? "Need Water":"Normal"}}</b-badge>
            </div>
            <div slot="key-tanggal" slot-scope="data">
              <b-badge :variant="dateFormatter(data.item.perangkat.data[data.item.perangkat.data.length-1].tanggal)">{{data.item.perangkat.data[data.item.perangkat.data.length-1].tanggal | formatDate}}</b-badge>
              
            </div>
            <div slot="key-kelembabanTanah" slot-scope="data">
              
              <strong>{{data.item.perangkat.data[data.item.perangkat.data.length-1].kelembabanTanah.toFixed(2)}}</strong>
              <div class="small text-muted">% RH</div>
            </div>
            <div slot="key-kelembabanUdara" slot-scope="data">
              <strong>{{data.item.perangkat.data[data.item.perangkat.data.length-1].kelembabanUdara.toFixed(2)}}</strong>
              <div class="small text-muted">% RH</div>
            </div>
            <div slot="key-suhuUdara" slot-scope="data">
              <strong>{{data.item.perangkat.data[data.item.perangkat.data.length-1].suhuUdara.toFixed(2)}}</strong>
              <div class="small text-muted">Celcius</div>
            </div>
            <!--
            ini mencobaaaaaaaaaaaaaaaaa
            -->

            <div slot="key-ph" slot-scope="data">
              <strong>{{data.item.perangkat.data[data.item.perangkat.data.length-1].ph.toFixed(2)}}</strong>
              <div class="small text-muted">Celcius</div>
            </div>

            <div slot="key-action" slot-scope="data">
              <b-button variant="primary" size="sm" @click="toDetail(data.item._id)">Show Details</b-button>
            </div>
            
          </b-table> 
            
          </b-row> 
            <b-alert v-if="existingData == false" show variant="warning">
              You don't have a plant in our system, let's manage your first plant by clicking the register plant button.
            </b-alert>
        </b-card>
      </b-col>
    </b-row>
          
    <b-modal variant="success" class="modal-warning"  ref="myModalRef" hide-footer title="Register">
      <div class="d-block text-center">
        <b-alert show variant="danger" v-if="errors.length > 0">
              <h4 class="alert-heading">Error !</h4>
              <ul>
                <li v-for="item in errors" :key="item">{{ item }}</li>
              </ul>
              <hr>
              <p class="mb-0">
               Please check again your form field.
              </p>
          </b-alert>
        <b-form-group>
          <b-form-input type="text" id="name" v-model="plantName" placeholder="Enter your plant ID or name"></b-form-input><br>
          <b-form-input type="text" id="large" v-model="plantLarge" placeholder="Enter your plant Large Area"></b-form-input><br>
          <b-form-input type="text" id="location" v-model="plantLocation" placeholder="Enter your plant Location"></b-form-input><br>
          <b-form-input type="text" id="spesies" v-model="plantSpesies" placeholder="Enter your plant spesies"></b-form-input><br>
          <b-form-input type="text" id="date" v-model="plantDate" placeholder="Enter your Date"></b-form-input>
        </b-form-group>
      </div>
      <b-btn class="mt-3" variant="outline-success" block @click="createPlant">Register</b-btn>
    </b-modal>


  </div>
</div>
</template>

<script>
import CardLine1ChartExample from './dashboard/CardLine1ChartExample'
import CardLine2ChartExample from './dashboard/CardLine2ChartExample'
import CardLine3ChartExample from './dashboard/CardLine3ChartExample'
import CardBarChartExample from './dashboard/CardBarChartExample'
import MainChartExample from './dashboard/MainChartExample'
import SocialBoxChartExample from './dashboard/SocialBoxChartExample'
import CalloutChartExample from './dashboard/CalloutChartExample'
import { Callout } from '@coreui/vue'
import io from 'socket.io-client'
import PostsService from "@/services/PostsService"
import Constants from "@/services/Constants"
import 'vue-spinners/dist/vue-spinners.css'
import { BounceSpinner } from 'vue-spinners/dist/vue-spinners.common'
import moment from 'moment'


export default {
  name: 'dashboard',
  filters:{
    formatDate : function(value){
      if (value) {
        return moment(String(value)).format('DD-MMM-YYYY HH:mm:ss')
      }
    }
  },
  components: {
    Callout,
    // myComponent,
    BounceSpinner,
    CardLine1ChartExample,
    CardLine2ChartExample,
    CardLine3ChartExample,
    CardBarChartExample,
    MainChartExample,
    SocialBoxChartExample,
    CalloutChartExample
  },
  data() {
    return {
      isLoading: true,
      DeviceActive:0,
      plantName:"",
      plantLarge:"",
      plantLocation:"",
      socket : io(Constants.SOCKET_SERVER),
      warningModal: false,
      DeviceNonActive:0,
      SoilMoistureAverage:0,
      HumidityAverage:0,
      SoilMoistureGraph:[],
      HumidityGraph:[],
      labelsData:[],
      CurrentConditions:"",
      kelembabanTanahArrange:[],
      statusDeviceInStr:"",
      dateOnFormat:"",
      dateOnFormatForAvg:"",
      existingData:false,
      tanamanList:[],
      selected: 'Month',
      tableItems: [],
      errors: [],
      successAlert: [],
      tableFields: [
        {
          key:'namaTanaman',
          label: 'Plant ID'
          
        },
        {
          key:'key-kondisi',
          label:'Current Condition'
        },
        { key: 'key-tanggal', 
          label: 'Time' 
        },
        { key: 'key-kelembabanTanah', 
          label: 'SoilMoisture' 
        },
        { key: 'key-kelembabanUdara', 
          label: 'Humidity' 
        },
        { key: 'key-suhuUdara', 
          label: 'Temperature' 
        },
        { key: 'key-ph', 
          label: 'Ph'
        },
        {
          key: 'key-action',
          label: 'Details'
        }
      ]
    }
  },
  created(){
      this.checkSession();
     
  },
  methods: {
    showModal () {
      /**
       * this function for show create plant form on modal
       */
      this.errors = []
      this.$refs.myModalRef.show()
    },
    async postCreatePlantData() {
      /**
       * post create plant data
       */
      this.successAlert = []
      const response = await PostsService.createPlant(window.localStorage.getItem("token"),{
                          namaTanaman: this.plantName,
                          luasLahan:this.plantLarge,
                          lokasiLahan:this.plantLocation,
                          spesies:this.plantSpesies,
                          tanggal:this.plantDate

                        });
      this.$refs.myModalRef.hide()
      if(response.data.status){
        this.successAlert.push('Congratulation,You have successfully register a new plant, our team will prepare your device, please refresh this page');
      }
      // setTimeout(location.reload(), 5000)
      
    },
    createPlant() {
      /**
       * this function for action when register plant button on clik
       */
      if(this.plantName && this.plantLarge && this.plantLocation && this.plantSpesies && this.plantDate){
        
        this.postCreatePlantData()
      }
      this.errors = []
      if(!this.plantName || !this.plantLarge || !this.plantLocation || !this.plantSpesies || !this.plantDate){
        this.errors.push('Sorry cant blank :( !');
      }
     
    },
    checkSession(){
      /**
       * check session and do action
       */
      if(!window.localStorage.getItem("token")){
        this.$router.push({ name: 'Login' })  
      }else{
        if(window.localStorage.getItem("role") != Constants.ROLE_FARMERS){
          // redirect to 404 page
          this.$router.push({ name: 'Page404' })    
        }else{
          this.firstLoad();
        }
        
      }
    },
    variant (value) {
      let $variant
      if (value <= 25) {
        $variant = 'info'
      } else if (value > 25 && value <= 50) {
        $variant = 'success'
      } else if (value > 50 && value <= 75) {
        $variant = 'warning'
      } else if (value > 75 && value <= 100) {
        $variant = 'danger'
      }
      return $variant
    },
    flag (value) {
      return 'flag-icon flag-icon-' + value
    },
    async fetchDataTanaman(){
      const response = await PostsService.getTanaman(window.localStorage.getItem("token"));
      return response.data;
    },
    soket(){
      this.socket.on('/topic/plants/'+window.localStorage.getItem("farmer_id"), (tanamanData) => {
            this.tableItems = tanamanData;
            var active =0,inActive =0,avgKelembabanTanah=0,avgHumidity=0;
            for(var i=0;i<tanamanData.length;i++){
            avgKelembabanTanah += Number(tanamanData[i].perangkat.data[tanamanData[i].perangkat.data.length-1].kelembabanTanah);
            avgHumidity += Number(tanamanData[i].perangkat.data[tanamanData[i].perangkat.data.length-1].kelembabanUdara);
            this.dateFormatter(tanamanData[i].perangkat.data[tanamanData[i].perangkat.data.length-1].tanggal);
            if(tanamanData[i].perangkat.status == 1){
              active++;
            }else{
              inActive++;
            }
          }
          avgKelembabanTanah = avgKelembabanTanah/tanamanData.length;
          avgHumidity = avgHumidity/tanamanData.length;
          this.tableItems = tanamanData;
          this.DeviceActive = active;
          this.DeviceNonActive = inActive;
          this.SoilMoistureAverage = avgKelembabanTanah.toFixed(2);
          this.HumidityAverage = avgHumidity.toFixed(2);
          // chart operation
          this.HumidityGraph.push(this.HumidityAverage);
          this.SoilMoistureGraph.push(this.SoilMoistureAverage);
          this.labelsData.push(this.dateOnFormat)
            
      });
    },
    async firstLoad(){
      // console.log(window.localStorage.getItem("token"));
      const response = await this.fetchDataTanaman();
      let tanamanData = response.data;
      this.isLoading=false
      if(tanamanData.length > 0){
          this.existingData = true
          var active =0,inActive =0,avgKelembabanTanah=0,avgHumidity=0;
          for(var i=0;i<tanamanData.length;i++){
            avgKelembabanTanah += Number(tanamanData[i].perangkat.data[tanamanData[i].perangkat.data.length-1].kelembabanTanah);
            avgHumidity += Number(tanamanData[i].perangkat.data[tanamanData[i].perangkat.data.length-1].kelembabanUdara);
            this.dateFormatter(tanamanData[i].perangkat.data[tanamanData[i].perangkat.data.length-1].tanggal);
            if(tanamanData[i].perangkat.status == 1){
              active++;
            }else{
              inActive++;
            }
          }
          avgKelembabanTanah = avgKelembabanTanah/tanamanData.length;
          avgHumidity = avgHumidity/tanamanData.length;
          this.tableItems = tanamanData;
          this.DeviceActive = active;
          this.DeviceNonActive = inActive;
          this.SoilMoistureAverage = avgKelembabanTanah.toFixed(2);
          this.HumidityAverage = avgHumidity.toFixed(2);
          // chart operation
          this.HumidityGraph.push(this.HumidityAverage);
          this.SoilMoistureGraph.push(this.SoilMoistureAverage);
          this.labelsData.push(this.dateOnFormat)
          // this.SoilMoistureGraph = [1,2,3,4,5,6,7]
          // this.labelsData = [1,2,3,4,5,6,7]
          this.soket();
      }else{
        this.existingData=false
      }
      
      // console.log(this.tableItems);
    },
    
    getBadge (status) {
      var varian_='danger'
      if(status==0){
        this.statusDeviceInStr="Nonactive";
      }else if(status==1){
        this.statusDeviceInStr="Active";
        varian_='success'
      }else{
        this.statusDeviceInStr="Pending"
        varian_='secondary'
      }
      // return status == 0 ? 'danger' : 'primary'
      return varian_
    },
    getKondisi(tmp){
      return tmp == 0 ? 'danger' : 'primary'
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
    toExpert(id){
      this.$router.push({ name: 'expert', params: {id : id} })
    },
    toDetail (id){
      this.$router.push({ name: 'Details', params: {id : id} })
      
    }
  } 
}
</script>

<style>
  /* IE fix */
  #card-chart-01, #card-chart-02 {
    width: 100% !important;
  }
  .list-tanaman-header{
    color:white;
  }
  .brand-card-header{
    background-color: #ffc107 !important;
  }
  .chart-wrapper canvas{
    /* width: 100% !important;  */
    /* margin-top: -10% !important;
    height: 50px !important; */
  }
</style>
