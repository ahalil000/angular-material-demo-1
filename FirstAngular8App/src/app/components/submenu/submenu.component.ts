import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-submenu',
  templateUrl: './submenu.component.html',
  styleUrls: ['./submenu.component.css']
})
export class SubmenuComponent implements OnInit {
  @Output() sidenavClose = new EventEmitter();

    appname: string;

  constructor() { }

  ngOnInit() {
      this.appname = "My Demo App";
  }

  public onSidenavClose = () => {
    this.sidenavClose.emit();
  }

}
