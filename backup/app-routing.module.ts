import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { TreeTableComponent } from './components/treetable/treetable.component';
import { TreeLoadComponent } from './components/treeload/treeload.component';
import { MenubarDemo } from './components/menubar/menubar.component';

const appRoutes: Routes = [
    {path: '', redirectTo: 'treetable', pathMatch: 'full'},
    {path: 'treetable', component: TreeTableComponent},
    {path: 'treeload', component: TreeLoadComponent},
    {path: 'menubar', component: MenubarDemo},
    {path: '**', redirectTo: 'home'}
];

export const AppRouting: ModuleWithProviders = RouterModule.forRoot(appRoutes);

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
