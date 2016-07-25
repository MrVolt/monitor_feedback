/**
 * Created by flo on 14.07.16.
 */
import {Component, OnInit} from '@angular/core'
import {Feedback} from '../models/Feedback'
import {FeedbackService} from '../services/feedback.service'
import { MdButton } from '@angular2-material/button';
import {MD_LIST_DIRECTIVES} from '@angular2-material/list'
import {MD_INPUT_DIRECTIVES} from '@angular2-material/input'

@Component({
    selector: "feedback-list",
    template: `
  <md-nav-list>
     <md-list-item *ngFor="let feedback of feedbacks" (click)="showFeedbackDetail(feedback)">
        <h3 style="font-weight: bold" md-line>{{feedback.title}}</h3>
        <p md-line style="color: #90a4ae">{{feedback.created}}</p>
     </md-list-item>
  </md-nav-list>
`,
    directives: [MdButton, MD_INPUT_DIRECTIVES, MD_LIST_DIRECTIVES]
})
export class FeedbacksComponent {

    private feedbacks: Feedback[];

    constructor(private feedbackService: FeedbackService){
      this.feedbackService.feedbackListEvent.subscribe(data => this.feedbacks = data)
    }

    private showFeedbackDetail(feedback: Feedback){
      this.feedbackService.SelectFeedback(feedback);
    }
}
