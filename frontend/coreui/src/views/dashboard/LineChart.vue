<script>
import { Line } from 'vue-chartjs'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips'
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities'

export default {
  extends: Line,
  props: ["datasoilmoisture","datahumidity","datatemperature","datasoilmoisturelimit","datahumiditylimit","datatemperaturelimit","soilmoistureupperlimit","humidityupperlimit","temperatureupperlimit","options","labels"],
  mounted() {
    this.renderLineChart();
  },
  computed: {
    chartDataSoilMoisture: function() {
      return this.datasoilmoisture;
    },
    chartDataHumidity: function(){
      return this.datahumidity;
    },
    chartDataTemperature: function(){
      return this.datatemperature;
    },
    chartDataSoilMoistureLimit: function(){
      return this.datasoilmoisturelimit;
    },
    chartDataHumidtyLimit: function(){
      return this.datahumiditylimit;
    },
    chartDataTemperatureLimit: function(){
      return this.datatemperaturelimit;
    },
    chartDataSoilMoistureUpperLimit: function(){
      return this.soilmoistureupperlimit;
    },
    chartDataHumidityUpperLimit: function(){
      return this.humidityupperlimit;
    },
    chartDataTemperatureUpperLimit: function(){
      return this.temperatureupperlimit;
    },
    labelsData: function(){
      return this.labels;
    }
  },
  methods: {
    renderLineChart: function() {
    const brandSuccess = getStyle('--success') || '#4dbd74'
    const brandInfo = getStyle('--info') || '#20a8d8'
    const brandDanger = getStyle('--danger') || '#654321'
    const brandWarning = getStyle('--warning') || '#ffc107'
    this.renderChart(
      {
        labels: this.labelsData,
        datasets: [
          {
            label: "Soil Moisture",
            backgroundColor: 'transparent',
            borderColor: '#654321',
            pointHoverBackgroundColor: '#fff',
            borderWidth: 4,
            data: this.chartDataSoilMoisture
            //data: [200, 210, 300, 450, 210, 450, 200, 210, 300, 450, 210, 110]
          },
          {
            label: 'Humidity',
            backgroundColor: 'transparent',
            borderColor: brandInfo,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 4,
            data: this.chartDataHumidity
            //data: [150, 430, 210, 300, 410, 200, 400, 200, 140, 210]
          },
                    {
            label: 'Temperature',
            backgroundColor: 'transparent',
            borderColor: brandSuccess,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 4,
            data: this.chartDataTemperature
            //data: [100, 400, 200, 100, 210, 100, 400, 200, 100, 210]
          },
          /*
          {
            label: 'Normal Soil Mositure Lower Limit',
            backgroundColor: hexToRgba(brandDanger, 10),
            borderColor: brandDanger,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 1,
            borderDash: [8, 5],
            data: this.chartDataSoilMoistureLimit
          },
          {
            label: 'Normal Soil Mositure Upper Limit',
            backgroundColor:'transparent',
            borderColor: brandDanger,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 1,
            borderDash: [8, 5],
            data: this.chartDataSoilMoistureUpperLimit
          },
          {
            label: 'Normal Humidity Lower Limit',
            backgroundColor: hexToRgba(brandDanger, 10),
            borderColor: brandDanger,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 1,
            borderDash: [8, 5],
            data: this.chartDataHumidtyLimit
          },
          {
            label: 'Normal Humidity Upper Limit',
            backgroundColor:'transparent',
            borderColor: brandDanger,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 1,
            borderDash: [8, 5],
            data: this.chartDataHumidityUpperLimit
          },
          {
            label: 'Normal Temperature Lower Limit',
            backgroundColor: hexToRgba(brandInfo, 10),
            borderColor: brandInfo,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 1,
            borderDash: [8, 5],
            data: this.chartDataTemperatureLimit
          },
          {
            label: 'Normal Temperature Upper Limit',
            backgroundColor: 'transparent',
            borderColor: brandInfo,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 1,
            borderDash: [8, 5],
            data: this.chartDataTemperatureUpperLimit
          }
        */
        ]
      },
      { 
        tooltips: {
          enabled: false,
          custom: CustomTooltips,
          intersect: true,
          mode: 'index',
          position: 'nearest',
          callbacks: {
            labelColor: function (tooltipItem, chart) {
              return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor }
            }
          }
        },
        elements: {
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 3
        }
        },
        // responsive: true, 
        maintainAspectRatio: false 
      }
    )
    }
  },
  watch: {
    datasoilmoisture: function() {
      // this._chart.destroy();
      console.log(this.datasoilmoisture);
      console.log(this.options);
      //this.renderChart(this.data, this.options);
      this.renderLineChart();
    }
  }
};
</script>