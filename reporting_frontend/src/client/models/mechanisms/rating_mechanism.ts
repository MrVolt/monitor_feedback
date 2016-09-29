import {Parameter} from './parameters/parameter';
import {Mechanism} from './mechanism';


export class RatingMechanism extends Mechanism {
    currentRatingValue:number;
    initialRating:number;

    constructor(id: number, type:string, active:boolean, order?:number, canBeActivated?:boolean, parameters?:Parameter[]) {
        super(id, type, active, order, canBeActivated, parameters);
        this.initialRating = this.getParameterValue('defaultRating');
        this.currentRatingValue = this.getParameterValue('defaultRating');
    }
}
