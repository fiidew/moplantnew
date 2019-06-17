<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col md="12">
        <b-card header="Monitoring" class="card-accent-warning">
    <b-card>
      <b-row>
        <b-col sm="5">
          <h4><img src="img/plant/plant.png" width="50px" alt="CoreUI Logo"> {{nameOfPlant}}</h4>
          <!-- <h4 id="traffic" class="card-title mb-0">Graph</h4> -->
          <!-- <div class="small text-muted">{{dateOnFormat}}</div> -->
          <b-badge v-bind:variant="conditions">{{CurrentConditions}}</b-badge> | 
           <b-badge v-bind:variant="statusDevice">{{statusDeviceInStr}}</b-badge> 
        </b-col>
        <b-col sm="7">
          <b-form inline class="float-right">
            <label class="mr-sm-2" for="inlineInput1">Start: </label>
            <b-input id="inlineInput1" type="date" v-model="startDate"></b-input>
            <label class="mx-sm-2" for="inlineInput2">End: </label>
            <b-input id="inlineInput2" type="date" v-model="endDate"></b-input>
            <b-button v-b-tooltip.hover title="Filter data" type="button" variant="primary" class="float-right" @click="filterData"><i class="icon-magnifier"></i></b-button> 
            <b-button v-b-tooltip.hover title="Streaming data" type="button" variant="warning" class="float-right" @click="firstLoad"><i class="icon-clock"></i></b-button>
            
          </b-form> 
        </b-col>
      </b-row>
      <bounce-spinner v-if="isLoading"></bounce-spinner>
      <line-chart v-if="isProcess" :labels="labelsData" :datasoilmoisture="dataChartSoilMoisture" :datahumidity="dataChartHumidity" :datatemperature="dataChartTemperature" :datasoilmoisturelimit="dataChartSoilMoistureLimit" :datahumiditylimit="dataChartHumidityLimit" :datatemperaturelimit="dataChartTemperatureLimit" :soilmoistureupperlimit="dataChartSoilMoistureUpperLimit" :humidityupperlimit="dataChartHumidityUpperLimit" :temperatureupperlimit="dataChartTemperatureUpperLimit" :options="{responsive: true, maintainAspectRatio: false}"></line-chart>
      <div slot="footer">
        <b-row class="text-center">
          <b-col class="mb-sm-6 mb-0">
            <div class="text-muted">Soil Moisture</div>
            <strong>{{currentSoilMoisture}}</strong>
              <b-progress height={} class="progress-xs mt-2" :precision="1" v-bind:value="100"></b-progress>
          </b-col>

          <b-col class="mb-sm-6 mb-0">
            <div class="text-muted">Humidity</div>
            <strong>{{currentHumidity}}</strong>
             <b-progress height={} class="progress-xs mt-2" :precision="1" v-bind:value="100"></b-progress>
          </b-col>
          
          <b-col class="mb-sm-6 mb-0">
            <div class="text-muted">Temperature</div>
            <strong>{{currentTemperature}}</strong>
             <b-progress height={} class="progress-xs mt-2" :precision="1" v-bind:value="100"></b-progress>
          </b-col>
        </b-row>
      </div>
    </b-card>
    <b-card>
            <!-- <b-row>  -->
              
            <!-- <b-table striped outlined stacked="sm" hover :items="tableItems" :fields="tableFields" head-variant="light" :current-page="currentPage" :per-page="perPage"> -->
           <b-table :hover="hover" :striped="striped" :bordered="bordered" :small="small" :fixed="fixed" responsive="sm" :items="tableItems" :fields="tableFields" :current-page="currentPage" :per-page="perPage">
           
            <div slot="key-kondisi" slot-scope="data">
              <b-badge :variant="getKondisi(data.item.kondisi)">{{data.item.kondisi == 0 ? "Abnormal":"Normal"}}</b-badge>
            </div>
            
            
            <div slot="key-kelembabanTanah" slot-scope="data">
              <strong>{{data.item.kelembabanTanah.toFixed(2)}}</strong>
              <div class="small text-muted">%RH</div>
            </div>
            <div slot="key-kelembabanUdara" slot-scope="data">
              <strong>{{data.item.kelembabanUdara.toFixed(2)}}</strong>
              <div class="small text-muted">%</div>
            </div>
            <div slot="key-suhuUdara" slot-scope="data">
              <strong>{{data.item.suhuUdara.toFixed(2)}}</strong>
              <div class="small text-muted">Celcius</div>
            </div>
             <div slot="key-tanggal" slot-scope="data">
              <b-badge :variant="dateFormatter(data.item.tanggal)">{{data.item.tanggal | formatDate}}</b-badge>
              
            </div>
            </b-table>
            <nav>
                <b-pagination :total-rows="getRowCount(tableItems)" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" hide-goto-end-buttons/>
            </nav>
            <!-- <nav>
              <b-pagination size="sm" :total-rows="tableItemsLength" :per-page="10" :limit="5" prev-text="prev" next-text="next" v-model="page"/>
            </nav> -->
            <!-- </b-row> -->
             </b-card>
        </b-card>
      </b-col>
    </b-row>

  </div>
</template>

<script>
import CardLine1ChartExample from './dashboard/CardLine1ChartExample'
import CardLine2ChartExample from './dashboard/CardLine2ChartExample'
import CardLine3ChartExample from './dashboard/CardLine3ChartExample'
import CardBarChartExample from './dashboard/CardBarChartExample'
import MainChartExample from './dashboard/MainChartExample'
import LineChart from './dashboard/LineChart'
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
  name: 'HistoryMonitoring',
  filters:{
    formatDate : function(value){
      if (value) {
        return moment(String(value)).format('DD-MMM-YYYY HH:mm:ss')
      }
    }
  },
  props: {
   
    hover: {
      type: Boolean,
      default: false
    },
    striped: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Callout,
    BounceSpinner,
    // myComponent,
    LineChart,
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
      isLoading:false,
      isProcess:true,
      currentPage: 1,
      perPage: 5,
      totalRows: 0,
      page:1,
      tableItemsLength:0,
      dataChartSoilMoisture: [],
      dataChartHumidity: [],
      dataChartTemperature: [],
      dataChartSoilMoistureLimit:[],
      dataChartSoilMoistureUpperLimit:[],
      dataChartHumidityLimit:[],
      dataChartHumidityUpperLimit:[],
      dataChartTemperatureLimit:[],
      dataChartTemperatureUpperLimit:[],
      labelsData:[],
      statusDeviceInStr:"",
      statusDevice:"",
      conditions:"",
      test: [4, 4, 4, 4, 4, 4],
      nameOfPlant:"",
      socket : io('localhost:3000'),
      CurrentConditions:"",
      dateOnFormat:"",
      currentTemperature:0,
      currentHumidity:0,
      currentSoilMoisture:0,
      tableItems: [],
      tableFields: [
        
        {
          key:'key-kondisi',
          label:'Condition'
        },
        { key: 'key-kelembabanTanah', 
          label: 'SoilMoisture' 
        },
        { key: 'key-kelembabanUdara', 
          label: 'KelembabanUdara' 
        },
        { key: 'key-suhuUdara', 
          label: 'Temperature' 
        },
        { key: 'key-tanggal', 
          label: 'Time' 
        }
      ],
      startDate:"",
      endDate:""
    }
  },
  created(){
      this.checkSession(); 
  },
  methods: {
     getRowCount (items) {
      return items.length
    },
    filterData: function(){
      this.processDataInTime()
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
    async fetchDataTanaman(){
      const response = await PostsService.getTanamanDetail(window.localStorage.getItem("token"),this.$route.params.id);
      return response.data;
    },
    async fetchDataToday(){
      const response = await PostsService.getDataToday(window.localStorage.getItem("token"),{
                          idTanaman: this.$route.params.id
                        });
      return response.data;
    },
    async fetchDataInTime(){
      const response = await PostsService.getDataInTime(window.localStorage.getItem("token"),{
                          idTanaman: this.$route.params.id,
                          start : this.startDate,
                          end: this.endDate
                        });
      return response.data;
    },
    soket(){
      this.socket.on('/topic/plants/detail/'+this.$route.params.id, (tanamanData) => {
        // this.tableItems = tanamanData.perangkat.data;
        this.currentTemperature= tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].suhuUdara.toFixed(2);
        this.currentSoilMoisture = tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].kelembabanTanah.toFixed(2);
        this.currentHumidity=tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].kelembabanUdara.toFixed(2);
        this.getBadge(tanamanData.perangkat.status);
        this.getKondisi(tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].kondisi);
        this.dateFormatter(tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].tanggal);
        // Chart operation
        if(this.dataChartSoilMoisture.length > 120){
          this.dataChartSoilMoisture.shift();
          this.dataChartHumidity.shift();
          this.dataChartTemperature.shift();
          this.dataChartSoilMoistureLimit.shift();
          this.dataChartSoilMoistureUpperLimit.shift();
          this.dataChartHumidityLimit.shift();
          this.dataChartHumidityUpperLimit.shift();
          this.dataChartTemperatureLimit.shift();
          this.dataChartTemperatureUpperLimit.shift();
          this.labelsData.shift();

          this.dataChartSoilMoisture.push(this.currentSoilMoisture);
          this.dataChartHumidity.push(this.currentHumidity);
          this.dataChartTemperature.push(this.currentTemperature);
          this.dataChartSoilMoistureLimit.push(48);
          this.dataChartSoilMoistureUpperLimit.push(80);
          this.dataChartHumidityLimit.push(48);
          this.dataChartHumidityUpperLimit.push(80);
          this.dataChartTemperatureLimit.push(37);
          this.dataChartTemperatureUpperLimit.push(39);
          this.labelsData.push(this.dateOnFormat);
        }else{
          this.dataChartSoilMoisture.push(this.currentSoilMoisture);
          this.dataChartHumidity.push(this.currentHumidity);
          this.dataChartTemperature.push(this.currentTemperature);
          this.dataChartSoilMoistureLimit.push(48);
          this.dataChartSoilMoistureUpperLimit.push(80);
          this.dataChartHumidityLimit.push(48);
          this.dataChartHumidityUpperLimit.push(80);
          this.dataChartTemperatureLimit.push(37);
          this.dataChartTemperatureUpperLimit.push(39);
          this.labelsData.push(this.dateOnFormat);
        }
        
        //=======
        
      })
    },
    
    async firstLoad(){
      this.dataChartSoilMoisture= []
      this.dataChartHumidity= []
      this.dataChartTemperature=[]
      this.dataChartSoilMoistureLimit=[]
      this.dataChartSoilMoistureUpperLimit=[]
      this.dataChartHumidityLimit=[]
      this.dataChartHumidityUpperLimit=[]
      this.dataChartTemperatureLimit=[]
      this.dataChartTemperatureUpperLimit=[]
      this.labelsData=[]
      this.tableItems=[]
      const response = await this.fetchDataToday();
      let tanamanData = response.data[0]; //because response data in array
      // console.log(this.selected)
      this.nameOfPlant = tanamanData.namaTanaman;
      // this.tableItems = tanamanData.perangkat.data;
      this.getBadge(tanamanData.perangkat.status);
      this.getKondisi(tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].kondisi);
      this.currentTemperature = tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].suhuUdara.toFixed(2);
      this.currentHumidity = tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].kelembabanUdara.toFixed(2);
      this.currentSoilMoisture = tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].kelembabanTanah.toFixed(2);
      this.soket();
    },
    async processDataInTime(){
      this.isLoading = true
      this.isProcess=false
      this.socket.removeListener('/topic/plants/detail/'+this.$route.params.id)
      this.dataChartSoilMoisture= []
      this.dataChartHumidity= []
      this.dataChartTemperature=[]
      this.dataChartSoilMoistureLimit=[]
      this.dataChartSoilMoistureUpperLimit=[]
      this.dataChartHumidityLimit=[]
      this.dataChartHumidityUpperLimit=[]
      this.dataChartTemperatureLimit=[]
      this.dataChartTemperatureUpperLimit=[]
      this.labelsData=[]
      this.tableItems = []
      const response = await this.fetchDataInTime();
      let tanamanData = response.data[0]; //because response data in array
      // console.log(this.selected)
      this.tableItems = tanamanData.perangkat.data;
      this.tableItemsLength = this.tableItems.length;
      console.log(this.tableItemsLength);
      this.getBadge(tanamanData.perangkat.status);
      this.getKondisi(tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].kondisi);
      this.currentTemperature = tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].suhuUdara.toFixed(2);
      this.currentHumidity = tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].kelembabanUdara.toFixed(2);
      this.currentSoilMoisture = tanamanData.perangkat.data[tanamanData.perangkat.data.length-1].kelembabanTanah.toFixed(2);
      for(var i=0;i<tanamanData.perangkat.data.length;i++){
        this.dataChartSoilMoisture.push(tanamanData.perangkat.data[i].kelembabanTanah.toFixed(2));
        this.dataChartHumidity.push(tanamanData.perangkat.data[i].kelembabanUdara.toFixed(2));
        this.dataChartTemperature.push(tanamanData.perangkat.data[i].suhuUdara.toFixed(2));
        this.dataChartSoilMoistureLimit.push(48);
        this.dataChartSoilMoistureUpperLimit.push(80);
        this.dataChartHumidityLimit.push(48);
        this.dataChartHumidityUpperLimit.push(80);
        this.dataChartTemperatureLimit.push(37);
        this.dataChartTemperatureUpperLimit.push(39);
        this.dateFormatter(tanamanData.perangkat.data[i].tanggal);
        this.labelsData.push(this.dateOnFormat);
      }
      this.isProcess=true
      this.isLoading=false
    },
    getBadge (status) {
      if(status==0){
        this.statusDeviceInStr="Device Nonactive";
        this.statusDevice="danger"
      }else{
        this.statusDeviceInStr="Device Active";
        this.statusDevice="success"
      }
      return status == 0 ? 'danger' : 'success'
    },
    getKondisi(tmp){
      
      var kondisiPointer = 0;
      if(Number(tmp) == 0 ){
        this.CurrentConditions="Abnormal";
        this.conditions="danger"
      }else{
        kondisiPointer = 1;
        this.CurrentConditions="Normal";
        this.conditions="success"
      }
      return kondisiPointer == 0 ? 'danger' : 'success'
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
    toDetail (id){
       this.$router.push({ name: 'Details', params: {id : id} })
      console.log(id);
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
  .header-section{
    text-align: center;
  }
</style>
