import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-gender-graph',
  templateUrl: './gender-graph.component.html',
  styleUrls: ['./gender-graph.component.scss']
})
export class GenderGraphComponent implements OnInit {
  @Input() men;
  @Input() women;
  @Input() other;
  @Input() unit;

  constructor() { }

  ngOnInit() {
  }

}
