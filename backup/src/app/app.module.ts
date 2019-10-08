import {FlexLayoutModule} from '@angular/flex-layout';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';

// import needed PrimeNG modules here
import { TreeModule } from 'primeng/components/tree/tree';
import { TreeTableModule } from 'primeng/components/treetable/treetable';
//import { TreeNode, TreeModule, TreeTableModule } from 'primeng/primeng';
import { TreeDragDropService } from 'primeng/components/common/api';
import { StepsModule } from 'primeng/steps'; // components/steps/steps';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
//import { StepsModule } from 'primeng/components/steps/steps';
import { ButtonModule } from 'primeng/components/button/button';
import { ContextMenuModule } from 'primeng/components/contextmenu/contextmenu';
import { GrowlModule } from 'primeng/components/growl/growl';

//import {WizardModule} from 'primeng-extensions-wizard/components/wizard.module';

import { LayoutComponent } from './components/layout/layout.component';
import { MaterialModule } from './components/material/material.module';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/navigation/header/header.component';
import { SidenavListComponent } from './components/navigation/sidenav-list/sidenav-list.component';
import { SubmenuComponent } from './components/submenu/submenu.component';

import { TreeNodeService } from './components/treetable/service/treenode.service'; 
import { TreeTableComponent }  from './components/treetable/treetable.component';
import { TreeLoadComponent } from './components/treeload/treeload.component';
import { MenubarDemo } from './components/menubar/menubar.component';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HomeComponent,
    HeaderComponent,
    SidenavListComponent,
    SubmenuComponent,
    TreeTableComponent,
    TreeLoadComponent,
    MenubarDemo
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MenuModule,
    MenubarModule,
    MaterialModule,
    FlexLayoutModule,
    TreeModule,
    TreeTableModule,
    //TreeLoadComponent,
    StepsModule,
    ButtonModule,
    ContextMenuModule,
    GrowlModule,
    BrowserAnimationsModule
    //WizardModule
  ],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}, TreeDragDropService, TreeNodeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
