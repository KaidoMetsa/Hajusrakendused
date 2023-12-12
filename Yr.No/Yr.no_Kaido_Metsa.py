import requests

def get_weather():
 
    url = "https://api.met.no/weatherapi/locationforecast/2.0/compact"
    params = {"lat": 59.4377, "lon": 24.7533} 
    headers = {"User-Agent": "yr.no aplikatsioon", "Authorization": "API"}

    response = requests.get(url, params=params, headers=headers)
    
    if response.status_code == 200:
        
        data = response.json()

        
        for timeseries in data["properties"]["timeseries"]:
            time = timeseries["time"]
            temperature = timeseries["data"]["instant"]["details"]["air_temperature"]
            print(f"{time} {temperature}C")
    else:
        print(f" Error koodiga {response.status_code}")

if __name__ == "__main__":
    get_weather()
