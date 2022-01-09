import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  getCovidSeriesData() {
    return this.http.get<any>('https://data.covid19india.org/v4/min/timeseries.min.json')
  }

  getCovidJsonData() {
    return this.http.get<any>('https://data.covid19india.org/v4/min/data.min.json')
  }
}
