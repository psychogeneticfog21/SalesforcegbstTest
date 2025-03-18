import LightningModal from 'lightning/modal';

import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import getOpps from '@salesforce/apex/OppAccount.getOpps';
import delOpps from '@salesforce/apex/OppAccount.delOpps';
import createOpps from '@salesforce/apex/OppAccount.createOpps';

export default class AccOppModal extends LightningModal {
    @api recordId;
    @track opps = [];
       isLoading = true;
    fields = ['Name','AccountId'];
    wiredResult;

    columns = [
        { label: 'Opportunity Name', fieldName: 'Name' },
        { label: 'Created Date', fieldName: 'CreatedDate', type: 'date' },
        { label: 'Last Modified Date', fieldName: 'LastModifiedDate', type: 'date' },
        { label: 'Days Passed', fieldName: 'DayPassed__c', type: 'number' }
    ];
    handleOk() {
        this.close('okay');
    }

    @wire(getOpps, { accountId: '$recordId' })
    wiredGetOpps(result) {
        this.wiredResult = result;
        if (result.data) {
            this.opps = result.data;
        } else if (result.error) {
            this.showToast('Error', 'Failed to load Opportunities', 'error');
        }
    }
    
    async handleCreateOpps() {
        this.isLoading = true;
        try {
            await createOpps({ accountId: this.recordId });
            this.showToast('Success', 'Opportunities created successfully!', 'success');
            await this.refreshOpps();
        } catch (error) {
            console.error('Error creating Opportunities:', error);
            this.showToast('Error', this.getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }
    
    async handleDelOpps() {
        this.isLoading = true;
        try {
            await delOpps({ accountId: this.recordId });
            this.showToast('Success', 'All related Opportunities deleted!', 'success');
            await this.refreshOpps();
        } catch (error) {
            console.error('Error deleting Opportunities:', error);
            this.showToast('Error', this.getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async refreshOpps() {
        try {
            await refreshApex(this.wiredResult);
        } catch (error) {
            console.error('Error refreshing Opportunities:', error);
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
    getErrorMessage(error) {
        return error?.body?.message || 'An unknown error occurred';
    }
    
}