import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Cloud, MapPin, Key, Thermometer, Globe } from 'lucide-react';
import { weatherService, WeatherConfig } from '@/services/weatherService';

export const WeatherSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<WeatherConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Load existing configuration
    const existingConfig = weatherService.loadConfig();
    if (existingConfig) {
      setConfig(existingConfig);
    } else {
      // Set default configuration
      setConfig({
        apiKey: '',
        provider: 'manual',
        location: {
          lat: 0,
          lon: 0,
          name: 'Site Location'
        },
        units: 'metric'
      });
    }
  }, []);

  const handleSaveConfig = async () => {
    if (!config) return;

    setLoading(true);
    try {
      weatherService.saveConfig(config);
      weatherService.clearCache(); // Clear cache to force refresh
      
      toast({
        title: 'Weather Configuration Saved',
        description: 'Weather settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save weather configuration.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!config) return;

    setTesting(true);
    try {
      await weatherService.getWeatherData();
      toast({
        title: 'Connection Successful',
        description: 'Weather API is working correctly.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'Unable to connect to weather API. Please check your configuration.',
      });
    } finally {
      setTesting(false);
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'openweather':
        return {
          name: 'OpenWeatherMap',
          url: 'https://openweathermap.org/api',
          description: 'Free tier: 1,000 calls/day',
          icon: <Globe className="w-4 h-4" />
        };
      case 'weatherapi':
        return {
          name: 'WeatherAPI.com',
          url: 'https://weatherapi.com',
          description: 'Free tier: 1M calls/month',
          icon: <Cloud className="w-4 h-4" />
        };
      default:
        return {
          name: 'Manual Entry',
          url: '',
          description: 'Enter weather data manually',
          icon: <Thermometer className="w-4 h-4" />
        };
    }
  };

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Weather Settings...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please wait while we load your configuration.</p>
        </CardContent>
      </Card>
    );
  }

  const providerInfo = getProviderInfo(config.provider);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Weather API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider">Weather Provider</Label>
          <Select
            value={config.provider}
            onValueChange={(value: 'openweather' | 'weatherapi' | 'manual') =>
              setConfig({ ...config, provider: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openweather">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>OpenWeatherMap</span>
                </div>
              </SelectItem>
              <SelectItem value="weatherapi">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span>WeatherAPI.com</span>
                </div>
              </SelectItem>
              <SelectItem value="manual">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  <span>Manual Entry</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {providerInfo.icon}
            <span>{providerInfo.description}</span>
            {providerInfo.url && (
              <a
                href={providerInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Get API Key
              </a>
            )}
          </div>
        </div>

        {/* API Key */}
        {config.provider !== 'manual' && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never shared.
            </p>
          </div>
        )}

        {/* Location Settings */}
        <div className="space-y-4">
          <Label>Location Settings</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="0.000000"
                value={config.location.lat}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    location: {
                      ...config.location,
                      lat: parseFloat(e.target.value) || 0
                    }
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder="0.000000"
                value={config.location.lon}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    location: {
                      ...config.location,
                      lon: parseFloat(e.target.value) || 0
                    }
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationName">Location Name</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="locationName"
                placeholder="Enter location name"
                value={config.location.name}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    location: {
                      ...config.location,
                      name: e.target.value
                    }
                  })
                }
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="space-y-2">
          <Label htmlFor="units">Temperature Units</Label>
          <Select
            value={config.units}
            onValueChange={(value: 'metric' | 'imperial') =>
              setConfig({ ...config, units: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Celsius (°C)</SelectItem>
              <SelectItem value="imperial">Fahrenheit (°F)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Manual Weather Entry */}
        {config.provider === 'manual' && (
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-medium mb-2">Manual Weather Entry</h4>
            <p className="text-sm text-muted-foreground">
              When using manual mode, weather data will be simulated. This is useful for testing
              or when API access is not available.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSaveConfig}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
          
          {config.provider !== 'manual' && config.apiKey && (
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          )}
        </div>

        {/* Current Configuration Status */}
        <div className="p-3 rounded-lg bg-muted/30 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={config.provider === 'manual' ? 'secondary' : 'default'}>
                {providerInfo.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {config.location.name}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {config.units === 'metric' ? '°C' : '°F'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

