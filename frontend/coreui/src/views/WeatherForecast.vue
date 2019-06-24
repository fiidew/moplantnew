<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col md="12" center>
        <b-card header="Weather Forecast" class="card-accent-success">
        <div slot="header">
              <b>Weather Forecast</b>
        </div>

    <b-card> 
          <center>
          <h4><img src="img/plant/location.png" width="40px" alt="CoreUI Logo">{{locationOfPlant}}-{{regionOfPlant}}-{{countryOfPlant}}</h4>
          <h6>Last Updated : {{lastUpdateWeather}}</h6>
          <br>
          <img v-bind:src="imageWeather" width="100px" hight="100px"/><br>
          <h4>{{conditionWeather}}</h4>
          </center>
          <br>
          <br>
          <b-row>
            <b-col md="" right>
            </b-col>
            <b-col md="" right>
              <h5>Temperature : {{temperatureOfWeather}} c</h5>
              <h5>Humidity    : {{humidityOfWeather}} %</h5>
              <h5>Pressure    : {{pressureOfWeather}} mBar</h5>
              <h5>Visibility  : {{visibilityOfWeather}} Km</h5>
            </b-col>
            <b-col md="" right>
              <h5>Feel like : {{feelLikeOfWeather}} c</h5>
              <h5>Wind      : {{windOfWeather}} km/h</h5>
              <h5>Uv        : {{uvOfWeather}} </h5>
              <h5>Gust      : {{gustOfWeather}} mph</h5>
            </b-col>
            <b-col md="">
            </b-col>
          </b-row>
        
      
      <bounce-spinner v-if="isLoading"></bounce-spinner>
      
      <div slot="footer">
        <b-row class="text-center">
          <b-col class="mb-sm-6 mb-0">
            <div class="text-muted">Total Precipitation (mm)</div>
            <strong>{{precOfWeather}}</strong>
              <b-progress height={} class="progress-xs mt-2" :precision="1" variant="secondary" v-bind:value="100"></b-progress>
          </b-col>

          <b-col class="mb-sm-6 mb-0">
            <div class="text-muted">Sunrise</div>
            <strong>{{sunriseOfWeather}}</strong>
             <b-progress height={} class="progress-xs mt-2" :precision="1" variant="secondary" v-bind:value="100"></b-progress>
          </b-col>
          
          <b-col class="mb-sm-6 mb-0">
            <div class="text-muted">Sunset</div>
            <strong>{{sunsetOfWeather}}</strong>
             <b-progress height={} class="progress-xs mt-2" :precision="1" variant="secondary" v-bind:value="100"></b-progress>
          </b-col>
        </b-row>
      </div>
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
  name: 'Details',
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
      nameOfPlant2:"",
      imageWeather:"",
      locationOfPlant:"",
      regionOfPlant:"",
      countryOfPlant:"",
      lastUpdateWeather:"",
      conditionWeather:"",
      windOfWeather:"",
      pressureOfWeather:"",
      precipOfWeather:"",
      humidityOfWeather:"",
      feelLikeOfWeather:"",
      uvOfWeather:"",
      gustOfWeather:"",
      precOfWeather:"",
      sunriseOfWeather:"",
      sunsetOfWeather:"",
      temperatureOfWeather:"",
      visibilityOfWeather:"",
      socket : io('localhost:3000'),
      CurrentConditions:"",
      dateOnFormat:"",
      currentTemperature:0,
      currentHumidity:0,
      currentSoilMoisture:0,
      tableItems: [],
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
    async fetchDataCuaca(){
      const response = await PostsService.getCuacaDetail(window.localStorage.getItem("token"),this.$route.params.city);
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
      const response = await this.fetchDataCuaca();
      let cuacaData = response.data;
      // console.log(this.selected)
      this.nameOfPlant = cuacaData.location.name;
      this.imageWeather=cuacaData.current.condition.icon;
      this.locationOfPlant=cuacaData.location.name;
      this.regionOfPlant=cuacaData.location.region;
      this.countryOfPlant=cuacaData.location.country;
      this.lastUpdateWeather=cuacaData.current.last_updated;
      this.conditionWeather=cuacaData.current.condition.text;
      this.temperatureOfWeather=cuacaData.current.temp_c;
      this.visibilityOfWeather=cuacaData.current.vis_km;
      this.windOfWeather=cuacaData.current.wind_mph;
      this.pressureOfWeather=cuacaData.current.pressure_mb;
      this.precipOfWeather=cuacaData.current.precip_mm;
      this.humidityOfWeather=cuacaData.current.humidity;
      this.feelLikeOfWeather=cuacaData.current.feelslike_c;
      this.precOfWeather=cuacaData.forecast.forecastday[0].day.totalprecip_mm;
      this.sunriseOfWeather=cuacaData.forecast.forecastday[0].astro.sunrise;
      this.sunsetOfWeather=cuacaData.forecast.forecastday[0].astro.sunset;
      this.uvOfWeather=cuacaData.current.uv;
      this.gustOfWeather=cuacaData.current.gust_mph;
      this.nameOfPlant2 = cuacaData.forecast.forecastday[0].day.totalprecip_mm;
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
       this.$router.push({ name: 'HistoryMonitoring', params: {id : id} })
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
