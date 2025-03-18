import { LightningElement, api } from 'lwc';
import AccOppModal from 'c/acctOppModal';
export default class AccPanel extends LightningElement {
    @api recordId; 
    async handleClick() {
        const result = await AccOppModal.open({
            size: 'large',
            description: 'Accessible description of modal\'s purpose',
            recordId: this.recordId,
        });
        console.log(result);
    }
}
