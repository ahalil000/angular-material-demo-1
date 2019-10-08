import { ServiceMessage } from './../core/Models/serviceMessage';
import { Constants } from './../shared/Models/constants';
import { LoginService } from './../login/login.service';
import { AppContextService } from './../core/Services/appContext.service';
import { Router, NavigationEnd } from '@angular/router';
import { Component, Input, OnInit, AfterViewInit, OnDestroy, ElementRef, Renderer, ViewChild, NgZone, ViewEncapsulation } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Location } from '@angular/common';
import { MenuItem, ScrollPanel } from 'primeng/primeng';
import { Globals } from '../globals';
import { UtilService } from '../core/Services';
import { BaseComponent } from '../core/Components/base.component';
import { Subscription } from "rxjs";

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomePage extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    model: any[];
    profileId: string;
    carouselMessages: ServiceMessage[] = [new ServiceMessage({ PathName: "", MessageType: "", Message: "", OriSignalRContextConnectionId: "" })];
    messageSubscription: Subscription;
    appMessageSubscription: Subscription;
    msgTimer: any;
    systemEnvironment: string;
    userName: string;
    isTraining: boolean = false;
    footerExists: boolean = false;

    // Start of Serenityng declarations
    menuClick: boolean;
    menuButtonClick: boolean;
    topbarMenuButtonClick: boolean;
    topbarMenuClick: boolean;
    topbarMenuActive: boolean;
    activeTopbarItem: Element;
    layoutMode = 'overlay';
    sidebarActive: boolean;
    mobileMenuActive: boolean;
    darkMenu: boolean;
    isRTL: boolean;
    menuHoverActive: boolean;
    resetMenu: boolean;
    @Input() reset: boolean;
    @ViewChild('scrollPanel') layoutMenuScrollerViewChild: ScrollPanel;
    //End of Serenityng declarations

    constructor(public globals: Globals, private router: Router, appContext: AppContextService, private loginService: LoginService) {
        super(appContext);
        this.messageSubscription = appContext.messageAlert().subscribe(message => {
            console.log("Homepage received message", message);
            this.carouselMessages = this.carouselMessages.filter(x => x.OriSignalRContextConnectionId !== message.OriSignalRContextConnectionId);
            this.carouselMessages.push(message);
            this.carouselMessages = this.carouselMessages.filter(x => x.PathName === "" || window.location.href.toLowerCase().lastIndexOf(x.PathName.toLowerCase()) >= 0);
        });
        this.appMessageSubscription = appContext.appMessageAlert().subscribe(message => {
            this.processAppMessage(message);
        });
    }
    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
        if (this.appMessageSubscription) {
            this.appMessageSubscription.unsubscribe();
        }
    }
    ngOnInit() {
        try {
            let that = this;
            this.initPage();
        } catch (ex) {
            this.util.hideWait();
            console.error(ex);
        }
    }
    initPage() {
        try {
            let that = this;
            this.systemEnvironment = this.appContext.systemEnvironment;
            this.isTraining = this.appContext.isTraining;
            this.userName = this.appContext.userName;
            this.model = [
                {
                    label: 'Dashboard',
                    icon: 'dashboard',
                    routerLink: 'dashboard',
                    styleClass: 'navbar-brand',
                }
            ];

            this.profileId = this.appContext.userUa.UserProfileId;
            this.startMessageTimer();

            this.loginService.getUserAccess("/home").subscribe(respUser => {
                this.appContext.homeUa = respUser;
                if (respUser.UserProfileId) {
                    this.profileId = respUser.UserProfileId;
                }
                if (this.appContext.homeUa && this.appContext.homeUa.UA && this.appContext.homeUa.UA.COMP && this.appContext.homeUa.UA.COMP.Companies && this.appContext.homeUa.UA.COMP.Companies.length !== 0) {
                    this.appContext.homeUa.UA.COMP.CompanyList = [];
                    this.appContext.homeUa.UA.COMP.Companies.forEach(function (element) {
                        if (element && element.CompanyId) {
                            that.appContext.homeUa.UA.COMP.CompanyList.push(element.CompanyId);
                        }
                    });
                }
                if (this.appContext.homeUa.UA["MENU"]) {
                    if (this.appContext.homeUa.UA["MENU"].UserAccessJSON && this.appContext.homeUa.UA["MENU"].UserAccessJSON.length !== 0) {
                        this.appContext.homeUa.UA["MENU"].UserAccessJSON.sort(this.compare);
                        let lvl1Menu = this.appContext.homeUa.UA["MENU"].UserAccessJSON.filter(x => x.LevelNumber === 1);
                        for (let i = 0; i < lvl1Menu.length; i++) {
                            let topLvl = {};
                            let lvl2Menu = this.appContext.homeUa.UA["MENU"].UserAccessJSON.filter(x => x.LevelNumber === 2 && x.ParentSystemAccessId === lvl1Menu[i].SystemAccessId);
                            if (lvl1Menu[i].AccessCode === "VENDOR" || lvl1Menu[i].AccessCode === "CUSTOMER") {
                                if (this.appContext.homeUa.UA["MENU"].VENDOR) {
                                    this.appContext.isVendorEnabled = true;
                                }
                                if (this.appContext.homeUa.UA["MENU"].CUSTOMER) {
                                    this.appContext.isCustomerEnabled = true;
                                }
                                if (this.appContext.homeUa.UA["MENU"].VENDOR && this.appContext.homeUa.UA["MENU"].CUSTOMER) {
                                    this.model.push(this.constructMenuTree(lvl1Menu[i]));
                                } else {
                                    for (let j = 0; j < lvl2Menu.length; j++) {
                                        this.model.push(this.constructMenuTree(lvl2Menu[j]));
                                    }
                                }
                            } else {
                                this.model.push(this.constructMenuTree(lvl1Menu[i]));
                            }
                        }
                    }
                } else {
                    this.appContext.util.showError("Access denied");
                    this.util.navigate(["/login"]);
                }
            }, error => {
                this.appContext.util.showError("Access denied");
                this.util.navigate(["/login"]);
            });
        } catch (ex) {
            this.util.hideWait();
            console.error(ex);
        }
    }
    constructMenuTree(topLevelItem) {
        let topLvl: any = {};
        let subLvlArray = this.appContext.homeUa.UA["MENU"].UserAccessJSON.filter(x => x.LevelNumber === (topLevelItem.LevelNumber + 1) && x.ParentSystemAccessId === topLevelItem.SystemAccessId);
        if (subLvlArray && subLvlArray.length !== 0) {
            topLvl = { label: topLevelItem.AccessName, icon: topLevelItem.DisplayIcon, items: [] };
            if (subLvlArray.length === 1) {
                topLvl = { label: topLevelItem.AccessName, icon: topLevelItem.DisplayIcon, routerLink: subLvlArray[0].PathName };
                if (subLvlArray[0].QueryParams) {
                    try {
                        topLvl.queryParams = JSON.parse(subLvlArray[0].QueryParams);
                    } catch (e) {
                        console.error(e, subLvlArray[0]);
                    }
                }
            } else {
                topLvl = { label: topLevelItem.AccessName, icon: topLevelItem.DisplayIcon, items: [] };
                for (let j = 0; j < subLvlArray.length; j++) {
                    let lvl3Array = this.appContext.homeUa.UA["MENU"].UserAccessJSON.filter(x => x.LevelNumber === (subLvlArray[j].LevelNumber + 1) && x.ParentSystemAccessId === subLvlArray[j].SystemAccessId);
                    if (lvl3Array && lvl3Array.length !== 0) {
                        topLvl.items.push(this.constructMenuTree(subLvlArray[j]));
                    } else {
                        let lvlItem: any = { label: subLvlArray[j].AccessName, icon: subLvlArray[j].DisplayIcon, routerLink: subLvlArray[j].PathName };
                        if (subLvlArray[j].QueryParams) {
                            try {
                                lvlItem.queryParams = JSON.parse(subLvlArray[j].QueryParams);
                            } catch (e) {
                                console.error(e, subLvlArray[j]);
                            }
                        }
                        topLvl.items.push(lvlItem);
                    }
                }
            }
        } else {
            topLvl = { label: topLevelItem.AccessName, icon: topLevelItem.DisplayIcon, routerLink: topLevelItem.PathName };
            if (topLevelItem.QueryParams) {
                try {
                    topLvl.queryParams = JSON.parse(topLevelItem.QueryParams);
                } catch (e) {
                    console.error(e, topLevelItem);
                }
            }
        }
        return topLvl;
    }
    compare(a, b) {
        if (a.SequenceNumber < b.SequenceNumber) {
            return -1;
        }
        if (a.SequenceNumber > b.SequenceNumber) {
            return 1;
        }
        return 0;
    }
    viewUserProfile(event: Event) {
        this.topbarMenuActive = false;
        this.util.navigate(["/home/acctAdmin/userProfile"]);
    }
    logout(event: Event) {
        this.topbarMenuActive = false;
        this.util.navigate(["/logout"]);
    }
    hideMessages() {
        this.carouselMessages = this.carouselMessages.filter(x => x.PathName === "" || window.location.href.toLowerCase().lastIndexOf(x.PathName.toLowerCase()) >= 0);
        return (!(this.carouselMessages && this.carouselMessages.length !== 0));
    }
    removeOldMessages() {
        if (this.msgTimer) {
            clearTimeout(this.msgTimer);
        }
        let tList = this.carouselMessages.filter(x => x.PathName === "" || x.DateReceived["diff"](window["moment"](new Date()), "minutes") >= -1);
        if (tList.length !== this.carouselMessages.length) {
            this.carouselMessages = this.carouselMessages.filter(x => x.PathName === "" || x.DateReceived["diff"](window["moment"](new Date()), "minutes") >= -1);
        }
        this.startMessageTimer();
    }
    startMessageTimer() {
        let that = this;
        if (this.msgTimer) {
            clearTimeout(this.msgTimer);
        }
        this.msgTimer = setTimeout(function () {
            that.removeOldMessages();
        }, 30000);
    }
    processAppMessage(message: ServiceMessage) {
        if (message.MessageType) {
            switch (message.MessageType) {
                case "":
                    break;
                default:
                    break;
            }
        } else {
            if (message.MessageJSON) {
                for (let key in message.MessageJSON) {
                    if (this.hasOwnProperty(key)) {
                        this[key] = message.MessageJSON[key];
                    } else {
                        this[key] = message.MessageJSON[key];
                    }
                }

            }
        }

    }
    test() {
        //this.appContext.sendMessage(this.util.newGuid(), "TestType", "TestMessage" );
        this.util.navigate(["/home/vendor/orders"], { queryParams: { pCode: "P1", exCan: true, dType: "Today", exCreated: true } });
        //this.util.navigate(["/home/vendor/ordersList"]);
    }

    //
    // serenityng functions begin

    ngAfterViewInit() {
        setTimeout(() => { this.layoutMenuScrollerViewChild.moveBar(); }, 100);
    }

    onWrapperClick() {
        if (!this.menuClick && !this.menuButtonClick) {
            this.mobileMenuActive = false;
        }

        if (!this.topbarMenuClick && !this.topbarMenuButtonClick) {
            this.topbarMenuActive = false;
            this.activeTopbarItem = null;
        }

        if (!this.menuClick) {
            if (this.isHorizontal() || this.isOverlay()) {
                this.resetMenu = true;
            }
            this.menuHoverActive = false;
        }

        this.menuClick = false;
        this.menuButtonClick = false;
        this.topbarMenuClick = false;
        this.topbarMenuButtonClick = false;
    }

    onMenuButtonClick(event: Event) {
        this.menuButtonClick = true;
        if (this.isMobile()) {
            this.mobileMenuActive = !this.mobileMenuActive;
        }
        event.preventDefault();
    }

    onTopbarMobileMenuButtonClick(event: Event) {
        this.topbarMenuButtonClick = true;
        this.topbarMenuActive = !this.topbarMenuActive;
        event.preventDefault();
    }

    onTopbarRootItemClick(event: Event, item: Element) {
        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null;
        } else {
            this.activeTopbarItem = item;
        }

        event.preventDefault();
    }

    onTopbarMenuClick(event: Event) {
        this.topbarMenuClick = true;
    }

    onSidebarClick(event: Event) {
        this.menuClick = true;
        this.resetMenu = false;
    }

    onToggleMenuClick(event: Event) {
        this.layoutMode = this.layoutMode !== 'static' ? 'static' : 'overlay';
        event.preventDefault();
    }

    isMobile() {
        return window.innerWidth <= 1024;
    }

    isTablet() {
        const width = window.innerWidth;
        return width <= 1024 && width > 640;
    }

    isHorizontal() {
        return this.layoutMode === 'horizontal';
    }

    isOverlay() {
        return this.layoutMode === 'overlay';
    }

    // serenityng end
    //
}

// template: `
//         <ng-template ngFor let-child let-i="index" [ngForOf]="(root ? item : item.items)">
//             <li [ngClass]="{'active-menuitem': isActive(i)}" [class]="child.badgeStyleClass">
//                 <a [href]="child.url||'#'" (click)="itemClick($event,child,i)" *ngIf="!child.routerLink"
//                    [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
//                    (mouseenter)="onMouseEnter(i)" class="ripplelink">
//                     <i class="material-icons">{{child.icon}}</i>
//                     <span class="menuitem-text">{{child.label}}</span>
//                     <i class="material-icons layout-submenu-toggler" *ngIf="child.items">keyboard_arrow_down</i>
//                     <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
//                 </a>

//                 <a (click)="itemClick($event,child,i)" *ngIf="child.routerLink"
//                    [routerLink]="child.routerLink" routerLinkActive="active-menuitem-routerlink"
//                    [routerLinkActiveOptions]="{exact: true}" [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
//                    (mouseenter)="onMouseEnter(i)" class="ripplelink">
//                     <i class="material-icons">{{child.icon}}</i>
//                     <span class="menuitem-text">{{child.label}}</span>
//                     <i class="material-icons layout-submenu-toggler" *ngIf="child.items">>keyboard_arrow_down</i>
//                     <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
//                 </a>
//                 <ul app-submenu [item]="child" *ngIf="child.items && isActive(i)" [visible]="isActive(i)" [reset]="reset"
//                     [parentActive]="isActive(i)" [@children]="(app.isHorizontal())&&root ? isActive(i) ?
//                     'visible' : 'hidden' : isActive(i) ? 'visibleAnimated' : 'hiddenAnimated'"></ul>
//             </li>
//         </ng-template>
//     `,

@Component({
    /* tslint:disable:component-selector */
    selector: '[app-submenu]',
    /* tslint:enable:component-selector */
    template: `
        <ng-template ngFor let-child let-i="index" [ngForOf]="(root ? item : item.items)">
            <li [ngClass]="{'active-menuitem': isActive(i)}" [class]="child.badgeStyleClass">
                <a [href]="child.url||'#'" (click)="itemClick($event,child,i)" *ngIf="!child.routerLink"
                   [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
                   (mouseenter)="onMouseEnter(i)" class="ripplelink">
                    <i class="material-icons">{{child.icon}}</i>
                    <span class="menuitem-text">{{child.label}}</span>
                    <i class="material-icons layout-submenu-toggler" *ngIf="child.items">keyboard_arrow_down</i>
                    <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
                </a>

                <a (click)="itemClick($event,child,i)" *ngIf="child.routerLink && !child.queryParams"
                   [routerLink]="child.routerLink" routerLinkActive="active-menuitem-routerlink"
                   [routerLinkActiveOptions]="{exact: true}" [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
                   (mouseenter)="onMouseEnter(i)" class="ripplelink">
                    <i class="material-icons">{{child.icon}}</i>
                    <span class="menuitem-text">{{child.label}}</span>
                    <i class="material-icons layout-submenu-toggler" *ngIf="child.items">>keyboard_arrow_down</i>
                    <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
                </a>

                <a (click)="itemClick($event,child,i)" *ngIf="child.routerLink && child.queryParams"
                   [routerLink]="child.routerLink" [queryParams]="child.queryParams" routerLinkActive="active-menuitem-routerlink"
                   [routerLinkActiveOptions]="{exact: true}" [attr.tabindex]="!visible ? '-1' : null" [attr.target]="child.target"
                   (mouseenter)="onMouseEnter(i)" class="ripplelink">
                    <i class="material-icons">{{child.icon}}</i>
                    <span class="menuitem-text">{{child.label}}</span>
                    <i class="material-icons layout-submenu-toggler" *ngIf="child.items">>keyboard_arrow_down</i>
                    <span class="menuitem-badge" *ngIf="child.badge">{{child.badge}}</span>
                </a>
                <ul app-submenu [item]="child" *ngIf="child.items && isActive(i)" [visible]="isActive(i)" [reset]="reset"
                    [parentActive]="isActive(i)" [@children]="(app.isHorizontal())&&root ? isActive(i) ?
                    'visible' : 'hidden' : isActive(i) ? 'visibleAnimated' : 'hiddenAnimated'"></ul>
            </li>
        </ng-template>
    `,
    animations: [
        trigger('children', [
            state('void', style({
                height: '0px'
            })),
            state('hiddenAnimated', style({
                height: '0px'
            })),
            state('visibleAnimated', style({
                height: '*'
            })),
            state('visible', style({
                height: '*',
                'z-index': 100
            })),
            state('hidden', style({
                height: '0px',
                'z-index': '*'
            })),
            transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('void => visibleAnimated, visibleAnimated => void',
                animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ]
})
export class AppSubMenuComponent {

    @Input() item: MenuItem;
    @Input() root: boolean;
    @Input() visible: boolean;
    _reset: boolean;
    _parentActive: boolean;
    activeIndex: number;

    constructor(public app: HomePage, public router: Router, public location: Location) { }

    itemClick(event: Event, item: MenuItem, index: number) {
        if (this.root) {
            this.app.menuHoverActive = !this.app.menuHoverActive;
            event.preventDefault();
        }

        // avoid processing disabled items
        if (item.disabled) {
            event.preventDefault();
            return true;
        }

        // activate current item and deactivate active sibling if any
        if (item.routerLink || item.items || item.command || item.url) {
            this.activeIndex = (this.activeIndex as number === index) ? -1 : index;
        }

        // execute command
        if (item.command) {
            item.command({ originalEvent: event, item: item });
        }

        // prevent hash change
        if (item.items || (!item.url && !item.routerLink)) {
            setTimeout(() => {
                this.app.layoutMenuScrollerViewChild.moveBar();
            }, 450);
            event.preventDefault();
        }

        // hide menu
        if (!item.items) {
            if (this.app.isMobile()) {
                this.app.sidebarActive = false;
                this.app.mobileMenuActive = false;
            }
            if (this.app.isHorizontal()) {
                this.app.resetMenu = true;
            } else {
                this.app.resetMenu = false;
            }
            this.app.menuHoverActive = !this.app.menuHoverActive;
        }
    }

    onMouseEnter(index: number) {
        if (this.root && this.app.menuHoverActive && this.app.isHorizontal()
            && !this.app.isMobile() && !this.app.isTablet()) {
            this.activeIndex = index;
        }
    }

    isActive(index: number): boolean {
        return this.activeIndex === index;
    }

    @Input() get reset(): boolean {
        return this._reset;
    }

    set reset(val: boolean) {
        this._reset = val;
        if (this._reset && (this.app.isHorizontal() || this.app.isOverlay())) {
            this.activeIndex = null;
        }
    }

    @Input() get parentActive(): boolean {
        return this._parentActive;
    }

    set parentActive(val: boolean) {
        this._parentActive = val;
        if (!this._parentActive) {
            this.activeIndex = null;
        }
    }
}
