export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: string;
  icon: string;
  location: string;
  timestamp: string;
}

export interface WeatherConfig {
  apiKey: string;
  provider: 'openweather' | 'weatherapi' | 'manual';
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  units: 'metric' | 'imperial';
}

class WeatherService {
  private config: WeatherConfig | null = null;
  private cache: { data: WeatherData; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Load configuration from localStorage
  loadConfig(): WeatherConfig | null {
    try {
      const stored = localStorage.getItem('weather-config');
      if (stored) {
        this.config = JSON.parse(stored);
        return this.config;
      }
    } catch (error) {
      console.error('Error loading weather config:', error);
    }
    return null;
  }

  // Save configuration to localStorage
  saveConfig(config: WeatherConfig): void {
    try {
      localStorage.setItem('weather-config', JSON.stringify(config));
      this.config = config;
    } catch (error) {
      console.error('Error saving weather config:', error);
    }
  }

  // Get weather data from OpenWeatherMap API
  private async fetchOpenWeatherData(config: WeatherConfig): Promise<WeatherData> {
    const { apiKey, location, units } = config;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=${units}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      forecast: this.getConcreteForecast(data),
      icon: data.weather[0].icon,
      location: location.name,
      timestamp: new Date().toISOString()
    };
  }

  // Get weather data from WeatherAPI.com
  private async fetchWeatherApiData(config: WeatherConfig): Promise<WeatherData> {
    const { apiKey, location } = config;
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location.lat},${location.lon}&aqi=no`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      temperature: Math.round(data.current.temp_c),
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph),
      forecast: this.getConcreteForecastFromWeatherApi(data),
      icon: this.mapWeatherApiIcon(data.current.condition.code),
      location: location.name,
      timestamp: new Date().toISOString()
    };
  }

  // Manual weather data entry
  private getManualWeatherData(): WeatherData {
    return {
      temperature: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      forecast: 'Good for concrete pouring',
      icon: '02d',
      location: this.config?.location.name || 'Manual Entry',
      timestamp: new Date().toISOString()
    };
  }

  // Get concrete-specific forecast recommendations
  private getConcreteForecast(weatherData: any): string {
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed * 3.6; // Convert to km/h
    const condition = weatherData.weather[0].main.toLowerCase();

    // Concrete pouring conditions
    if (temp < 5) {
      return 'Poor - Temperature too low for concrete pouring';
    }
    if (temp > 35) {
      return 'Caution - High temperature may cause rapid setting';
    }
    if (humidity > 80) {
      return 'Caution - High humidity may affect curing';
    }
    if (windSpeed > 40) {
      return 'Poor - High winds may cause surface issues';
    }
    if (condition.includes('rain') || condition.includes('storm')) {
      return 'Poor - Rain will damage concrete surface';
    }
    if (condition.includes('fog') || condition.includes('mist')) {
      return 'Caution - Moist conditions may affect finish';
    }

    return 'Good for concrete pouring';
  }

  private getConcreteForecastFromWeatherApi(weatherData: any): string {
    const temp = weatherData.current.temp_c;
    const humidity = weatherData.current.humidity;
    const windSpeed = weatherData.current.wind_kph;
    const condition = weatherData.current.condition.text.toLowerCase();

    // Same logic as OpenWeatherMap
    if (temp < 5) {
      return 'Poor - Temperature too low for concrete pouring';
    }
    if (temp > 35) {
      return 'Caution - High temperature may cause rapid setting';
    }
    if (humidity > 80) {
      return 'Caution - High humidity may affect curing';
    }
    if (windSpeed > 40) {
      return 'Poor - High winds may cause surface issues';
    }
    if (condition.includes('rain') || condition.includes('storm')) {
      return 'Poor - Rain will damage concrete surface';
    }
    if (condition.includes('fog') || condition.includes('mist')) {
      return 'Caution - Moist conditions may affect finish';
    }

    return 'Good for concrete pouring';
  }

  private mapWeatherApiIcon(code: number): string {
    // Map WeatherAPI condition codes to OpenWeatherMap icons
    const iconMap: { [key: number]: string } = {
      1000: '01d', // Sunny
      1003: '02d', // Partly cloudy
      1006: '04d', // Cloudy
      1009: '04d', // Overcast
      1030: '50d', // Mist
      1063: '10d', // Patchy rain
      1087: '11d', // Thundery outbreaks
      1114: '13d', // Blowing snow
      1117: '13d', // Blizzard
      1135: '50d', // Fog
      1147: '50d', // Freezing fog
      1150: '09d', // Patchy light drizzle
      1153: '09d', // Light drizzle
      1168: '09d', // Freezing drizzle
      1171: '09d', // Heavy freezing drizzle
      1180: '09d', // Patchy light rain
      1183: '10d', // Light rain
      1186: '10d', // Moderate rain at times
      1189: '10d', // Moderate rain
      1192: '10d', // Heavy rain at times
      1195: '10d', // Heavy rain
      1198: '09d', // Light freezing rain
      1201: '09d', // Moderate or heavy freezing rain
      1204: '09d', // Light sleet
      1207: '09d', // Moderate or heavy sleet
      1210: '13d', // Patchy light snow
      1213: '13d', // Light snow
      1216: '13d', // Patchy moderate snow
      1219: '13d', // Moderate snow
      1222: '13d', // Patchy heavy snow
      1225: '13d', // Heavy snow
      1237: '13d', // Ice pellets
      1240: '09d', // Light rain shower
      1243: '09d', // Moderate or heavy rain shower
      1246: '09d', // Torrential rain shower
      1249: '09d', // Light sleet showers
      1252: '09d', // Moderate or heavy sleet showers
      1255: '13d', // Light snow showers
      1258: '13d', // Moderate or heavy snow showers
      1261: '13d', // Light showers of ice pellets
      1264: '13d', // Moderate or heavy showers of ice pellets
      1273: '11d', // Patchy light rain with thunder
      1276: '11d', // Moderate or heavy rain with thunder
      1279: '11d', // Patchy light snow with thunder
      1282: '11d', // Moderate or heavy snow with thunder
    };

    return iconMap[code] || '01d';
  }

  // Main method to get weather data
  async getWeatherData(): Promise<WeatherData> {
    // Check cache first
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.data;
    }

    // Load config if not already loaded
    if (!this.config) {
      this.config = this.loadConfig();
    }

    // If no config, return default data
    if (!this.config) {
      return this.getManualWeatherData();
    }

    try {
      let weatherData: WeatherData;

      switch (this.config.provider) {
        case 'openweather':
          weatherData = await this.fetchOpenWeatherData(this.config);
          break;
        case 'weatherapi':
          weatherData = await this.fetchWeatherApiData(this.config);
          break;
        case 'manual':
        default:
          weatherData = this.getManualWeatherData();
          break;
      }

      // Cache the result
      this.cache = {
        data: weatherData,
        timestamp: Date.now()
      };

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return cached data if available, otherwise fallback
      if (this.cache) {
        return this.cache.data;
      }
      return this.getManualWeatherData();
    }
  }

  // Clear cache (useful for testing or forcing refresh)
  clearCache(): void {
    this.cache = null;
  }

  // Get weather icon URL
  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
}

export const weatherService = new WeatherService();

