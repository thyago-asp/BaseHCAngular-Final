import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss']
})
export class NavigatorComponent implements OnInit {
  menuAnimateOn = 'animate__fadeInLeft';
  menuAnimateOff = 'animate__fadeOutLeft';

  constructor(
    private router: Router,
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
  }

  navigate(route) {
    this.router.navigate([route]);
  }

  isActive(page: string) {
    return this.router.url.includes(page);
  }

}
