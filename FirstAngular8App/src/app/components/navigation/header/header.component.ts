import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Output() public sidenavToggle = new EventEmitter();
  topbarMenuClick: boolean;
  userName: string;
  appname: string;

  constructor() { }

  ngOnInit() {
    this.userName = "AndrewH";
    this.appname = "My Demo App";
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  onWrapperClick() {
    this.topbarMenuClick = false;
  }

  onTopbarMenuClick(event: Event) {
    this.topbarMenuClick = true;
  }



}
