import { Component } from '@angular/core';
import { Message, TreeNode, MenuItem } from 'primeng/components/common/api';
import { StepsModule, Steps } from 'primeng/steps'; // components/steps/steps';

import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';

//import { Steps, StepsModule } from 'primeng/components/steps/steps';
import { TreeTableModule, TreeTable } from 'primeng/components/treetable/treetable';
import { TreeNodeService } from './service/treenode.service';

@Component({
    selector: 'treetabledemo',
    templateUrl: 'treetable.component.html'
})
export class TreeTableComponent {
    msgs: Message[] = [];

    activeIndex: number = 0;

    basicTreeTable: TreeNode[];

    singleSelectionTreeTable: TreeNode[];

    multipleSelectionTreeTable: TreeNode[];

    checkboxSelectionTreeTable: TreeNode[];

    templateTreeTable: TreeNode[];

    contextmenuTreeTable: TreeNode[];

    lazyTreeTable: TreeNode[];

    selectedTouristPlace: TreeNode;

    selectedPlace: TreeNode;

    selectedTouristPlaces: TreeNode[];

    selectedMultiTouristPlaces: TreeNode[];

    items: MenuItem[];

    constructor(private nodeService: TreeNodeService) { }

    onChangeStep(label: string) {
        this.msgs.length = 0;
        this.msgs.push({severity: 'info', summary: label});
    }

    ngOnInit() {
        this.nodeService.getTouristPlaces().subscribe((places: any) => this.basicTreeTable = places);
        this.nodeService.getTouristPlaces().subscribe((places: any) => this.singleSelectionTreeTable = places);
        this.nodeService.getTouristPlaces().subscribe((places: any) => this.multipleSelectionTreeTable = places);
        this.nodeService.getTouristPlaces().subscribe((places: any) => this.checkboxSelectionTreeTable = places);
        this.nodeService.getTouristPlaces().subscribe((places: any) => this.templateTreeTable = places);
        this.nodeService.getTouristPlaces().subscribe((places: any) => this.contextmenuTreeTable = places);
        this.nodeService.getTouristPlaces().subscribe((places: any) => this.lazyTreeTable = places);

        this.items = [
            {label: 'View', icon: 'fa-search', command: (event) => this.viewNode(this.selectedPlace)},
            {label: 'Delete', icon: 'fa-close', command: (event) => this.deleteNode(this.selectedPlace)}
        ];


        this.items = [{
            label: 'Personal',
            command: (event: any) => {
                this.activeIndex = 0;
                //this.messageService.add({severity:'info', summary:'First Step', detail: event.item.label});
            }
        },
        {
            label: 'Seat',
            command: (event: any) => {
                this.activeIndex = 1;
                //this.messageService.add({severity:'info', summary:'Seat Selection', detail: event.item.label});
            }
        },
        {
            label: 'Payment',
            command: (event: any) => {
                this.activeIndex = 2;
                //this.messageService.add({severity:'info', summary:'Pay with CC', detail: event.item.label});
            }
        },
        {
            label: 'Confirmation',
            command: (event: any) => {
                this.activeIndex = 3;
                //this.messageService.add({severity:'info', summary:'Last Step', detail: event.item.label});
            }
        }
    ];        

    }

    nodeSelect(event: any) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Selected', detail: event.node.data.name});
    }

    nodeUnselect(event: any) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Unselected', detail: event.node.data.name});
    }

    onRowDblclick(event: any) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Selected', detail: "The TreeTable row double click is invoked"});
    }

    nodeExpand(event: any) {
        if (event.node) {
            //in a real application, make a call to a remote url to load children of the current node and add the new nodes as children
            this.nodeService.getTouristPlaces().subscribe(nodes => event.node.children = nodes);
        }
    }

    viewNode(node: TreeNode) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Selected', detail: node.data.name});
    }

    deleteNode(node: TreeNode) {
        node.parent.children = node.parent.children.filter( n => n.data !== node.data);
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Deleted', detail: node.data.name});
    }
}
