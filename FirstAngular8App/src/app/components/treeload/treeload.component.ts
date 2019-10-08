import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'primeng/shared';
import { TreeModule, TreeTableModule } from 'primeng/primeng';
import { Message, TreeNode, MenuItem } from 'primeng/components/common/api';
import { Observable } from 'rxjs/internal/Observable';
import { TreeLoadData } from '../models/treeloaddata';
import { of } from 'rxjs/internal/observable/of';


@Component({
    selector: 'treeload',
    templateUrl: 'treeload.component.html'
})
export class TreeLoadComponent implements OnInit {

    dataload: TreeNode[];

    constructor() { }

    ngOnInit() {
        
        this.gettreedata().subscribe(resp => {
            this.dataload = resp;
        });
    }

    gettreedata(): Observable<any[]>
    {
        let loaddata: TreeLoadData[] = 
        [
            { "ID":1,"TypeCode":"TC1", "GroupCode":"", "AreaCode":"" },
            { "ID":2,"TypeCode":"TC1", "GroupCode":"GC1", "AreaCode":"" },
            { "ID":3,"TypeCode":"TC1", "GroupCode":"GC1", "AreaCode":"AC1" },
            { "ID":4,"TypeCode":"TC1", "GroupCode":"", "AreaCode":"AC1" },
            { "ID":5,"TypeCode":"TC1", "GroupCode":"GC2", "AreaCode":"AC2" },
            { "ID":6,"TypeCode":"TC1", "GroupCode":"GC2", "AreaCode":"" }
        ] 
        return of(loaddata);
    }

}
