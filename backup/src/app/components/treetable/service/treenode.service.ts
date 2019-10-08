import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
//import 'rxjs/add/operator/map';
import {TreeNode} from 'primeng/components/common/api';

@Injectable()
export class TreeNodeService {

    constructor(private http: HttpClient) {
    }

    // getTouristPlaces(): Observable<any[]> {
    //     return this.http.get('/assets/data/cities.json');
    // }

    getTouristPlaces() {
        return this.http.get('/assets/data/cities.json');
        // /assets/data/cities.json');
    }
}
