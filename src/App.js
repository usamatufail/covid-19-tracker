import React, { useState, useEffect } from "react";
//material-ui
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
//axios
import axios from "./axios";
//custom components
import InfoBox from "./Components/InfoBox";
import Map from "./Components/Map";
import Table from "./Components/Table";
import LineGraph from "./Components/LineGraph";
//utility functions
import { sortData } from "./utils/sorter";
import { prettyPrintStat } from "./utils/statAndMapData";
//React-Reveal for smooth animations
import Fade from "react-reveal/Fade";
//css
import "./App.css";
//leaflet css
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  //Useeffect to get countries
  useEffect(() => {
    const getCountriesData = async () => {
      const res = await axios.get("/countries");
      //setting countries for map
      setMapCountries(res.data);
      //creating countries array for dropdown selection
      const countriesArray = res.data.map((data) => {
        return {
          name: data.country,
          value: data.countryInfo.iso2,
        };
      });
      setCountries(countriesArray);
      //passing all countries data to the table data state variable
      const sortedCountriesData = sortData(res.data);
      setTableData(sortedCountriesData);
    };
    getCountriesData();
  }, []);

  //useEffect to get worldwide data
  React.useEffect(() => {
    const worldWideData = async () => {
      const res = await axios.get("/all");
      setCountryInfo(res.data);
    };
    worldWideData();
  }, []);

  //onCountryChange Function
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    const url =
      countryCode === "worldwide" ? "/all" : `countries/${countryCode}`;
    const res = await axios.get(url);
    setCountry(countryCode);
    setCountryInfo(res.data);
    setMapCenter([res.data.countryInfo.lat, res.data.countryInfo.long]);
    setMapZoom(4);
  };

  console.log(mapCountries);

  return (
    <>
      <div className="app">
        <div className="app__left">
          <div className="app__header">
            <Fade left>
              <h1>COVID-19 TRACKER</h1>
            </Fade>
            <Fade right>
              <FormControl className="app__dropdown">
                <Select
                  variant="outlined"
                  value={country}
                  onChange={onCountryChange}
                >
                  <MenuItem value="worldwide">Worldwide</MenuItem>
                  {countries.map((country, i) => {
                    return (
                      <MenuItem key={i} value={country.value}>
                        {country.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Fade>
          </div>
          <Fade left>
            <div className="app__stats">
              <InfoBox
                isRed
                active={casesType === "cases"}
                onClick={() => setCasesType("cases")}
                title="Coronavirus Cases"
                cases={prettyPrintStat(countryInfo.todayCases)}
                total={prettyPrintStat(countryInfo.cases)}
              />
              <InfoBox
                active={casesType === "recovered"}
                onClick={() => setCasesType("recovered")}
                title="Recovered"
                cases={prettyPrintStat(countryInfo.todayRecovered)}
                total={prettyPrintStat(countryInfo.recovered)}
              />
              <InfoBox
                isRed
                active={casesType === "deaths"}
                onClick={() => setCasesType("deaths")}
                title="Deaths"
                cases={prettyPrintStat(countryInfo.todayDeaths)}
                total={prettyPrintStat(countryInfo.deaths)}
              />
            </div>
          </Fade>
          <Fade left>
            <Map
              casesType={casesType}
              center={mapCenter}
              zoom={mapZoom}
              countries={mapCountries}
            />
          </Fade>
        </div>
        <Fade right>
          <Card className="app__right">
            <CardContent>
              <div className="app__information">
                <h3>Live Cases by Country</h3>
                <Table countries={tableData} />
                <h3>Worldwide new {casesType}</h3>
                <LineGraph casesType={casesType} />
              </div>
            </CardContent>
          </Card>
        </Fade>
      </div>
      <div className="app__footer">
        <h4 className="app__footerDetail">
          Created by Usama Tufail @CleverProgrammerLiveBootCamp
        </h4>
        <p>
          <strong>Technologies Used:</strong>&nbsp;React, React Hooks, React
          Charts, Leaflet Map, Material UI
        </p>
      </div>
    </>
  );
}

export default App;
