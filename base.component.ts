import { OnDestroy, Injectable, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { AppContextService, UtilService } from '../Services';
import { Globals } from '../../globals';
import { LocatorService } from '../Services/locator.service';
import { Menubar, MenuItem } from 'primeng/primeng';

@Injectable()
export abstract class BaseComponent implements OnDestroy {

	protected destroyed$: Subject<boolean> = new Subject<boolean>();
	public editMode: boolean = false;
	public isNew: boolean = false;
	public util: UtilService;
	submitted: boolean = false;

	public navigationSubscription: any;
	public initCompleted: boolean = false;
	public queryParams: any;

	public headerLeftMenuItems: MenuItem[];
	public headerRightMenuItems: MenuItem[];
	public footerLeftMenuItems: MenuItem[];
	public footerRightMenuItems: MenuItem[];
	public footerSubMenuItems: any;
	public footerSlideBarVisible: boolean = false;

	private lvfooterExists: boolean = true;
	private lvHideMenu: boolean = false;
	private lvLeftMenu: MenuItem[];
	private lvRightMenu: MenuItem[];
	private sentFooterExists: boolean = false;
	private sendFooterMsgTimer: any;

	
	save(): boolean {
		return true;
	}

	prepareSave(): boolean {
		this.submitted = true;
		return true;
	}

	validate(errors: string[]): boolean {
		return true;
	}

	constructor(public appContext: AppContextService) {
		this.util = this.appContext.util;
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
		this.appContext.util.clearMessages();
	}

	navigateBack() {
		this.appContext.location.back();
	}
	set hideMenu(value: boolean) {
		this.lvHideMenu = value;
	}
	get hideMenu() { return this.lvHideMenu; }
	set footerExists(value: boolean) {
		this.lvfooterExists = value;
		this.setFooterExists(this.lvfooterExists);
	}
	get footerExists() { return this.lvfooterExists; }
	set leftMenu(value: MenuItem[]) {
		this.lvLeftMenu = value;
		this.setLeftMenu();
	}
	get leftMenu() { return this.lvLeftMenu; }
	set rightMenu(value: MenuItem[]) {
		this.lvRightMenu = value;
		this.setRightMenu();
	}
	get rightMenu() { return this.lvRightMenu; }

	private setFooterExists(footerExists: boolean = false) {
		let that = this;
		if (!this.sentFooterExists) {
			this.sentFooterExists = true;
			this.sendFooterMsgTimer = setTimeout(function () {
				if (that.sendFooterMsgTimer) {
					clearTimeout(that.sendFooterMsgTimer);
				}
				that.sendFooterMsgTimer = undefined;
				that.appContext.sendAppMessage("", { footerExists: footerExists });
			}, 500);
		}
	}
	private setLeftMenu() {
		if (this.lvLeftMenu) {
			this.headerLeftMenuItems = this.lvLeftMenu;
			if (this.lvfooterExists) {
				let footerLeftMenu: MenuItem[] = [];
				let i: number = -1;
				this.headerLeftMenuItems.forEach(menuItem => {
					i += 1;
					if (menuItem.disabled) {
						menuItem.routerLink = undefined;
					}
					if (menuItem.items && menuItem.items.length) {
						if (!menuItem.id) {
							menuItem.id = i.toString();
						}
						for (let j = 0; j < menuItem.items.length; j++) {
							if (menuItem.items[j]["disabled"]) {
								menuItem.items[j]["routerLink"] = undefined;
							}
						}

						let tMenuItem = this.util.deepClone(menuItem);
						tMenuItem.items = undefined;
						tMenuItem.command = (event) => {
							if (!event.item.disabled) {
								if (!this.footerSlideBarVisible) {
									let tSubMenu: any = this.headerLeftMenuItems.filter(x => x.id === event.item.id)[0].items;
									if (tSubMenu) {
										this.footerSubMenuItems = tSubMenu;
									}
									this.footerSlideBarVisible = !this.footerSlideBarVisible;
								} else {
									this.footerSlideBarVisible = !this.footerSlideBarVisible;
									this.footerSubMenuItems = [];
								}
							}
						};
						if (!tMenuItem.icon) {
							tMenuItem.icon = "";
						}
						//tMenuItem.icon = 'fas fa-chevron-up ' + tMenuItem.icon;
						tMenuItem.items = undefined;
						footerLeftMenu.push(tMenuItem);
					} else {
						footerLeftMenu.push(menuItem);
					}
				});
				this.footerLeftMenuItems = footerLeftMenu;
			} else {
				this.footerLeftMenuItems = undefined;
			}
		}
	}
	private setRightMenu() {
		if (this.lvRightMenu) {
			this.headerRightMenuItems = this.lvRightMenu;
			if (this.lvfooterExists) {
				let footerRightMenu: MenuItem[] = [];
				let i: number = -1;
				this.headerRightMenuItems.forEach(menuItem => {
					i += 1;
					if (menuItem.disabled) {
						menuItem.routerLink = undefined;
					}
					if (menuItem.items && menuItem.items.length) {
						if (!menuItem.id) {
							menuItem.id = i.toString();
						}
						for (let j = 0; j < menuItem.items.length; j++) {
							if (menuItem.items[j]["disabled"]) {
								menuItem.items[j]["routerLink"] = undefined;
							}
						}
						let tMenuItem = this.util.deepClone(menuItem);
						tMenuItem.items = undefined;
						tMenuItem.command = (event) => {
							if (!event.item.disabled) {
								if (!this.footerSlideBarVisible) {
									let tSubMenu: any = this.headerRightMenuItems.filter(x => x.id === event.item.id)[0].items;
									if (tSubMenu) {
										this.footerSubMenuItems = tSubMenu;
									}
									this.footerSlideBarVisible = !this.footerSlideBarVisible;
								} else {
									this.footerSlideBarVisible = !this.footerSlideBarVisible;
									this.footerSubMenuItems = [];
								}
							}
						};
						if (!tMenuItem.icon) {
							tMenuItem.icon = "";
						}
						//tMenuItem.icon = 'fas fa-chevron-up ' + tMenuItem.icon;
						tMenuItem.items = undefined;
						footerRightMenu.push(tMenuItem);
					} else {
						footerRightMenu.push(menuItem);
					}
				});
				this.footerRightMenuItems = footerRightMenu;
			} else {
				this.footerRightMenuItems = undefined;
			}
		}
	}
}
