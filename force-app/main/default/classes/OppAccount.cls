public with sharing class OppAccount {
    

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpps(Id accountId) {
        if (!Schema.sObjectType.Opportunity.isAccessible()) {
            throw new SecurityException('Insufficient permissions to access Opportunity records.');
        }

        return [
            SELECT Id, Name, CreatedDate, LastModifiedDate, DayPassed__c
            FROM Opportunity 
            WHERE AccountId = :accountId
        ];
    }

    @AuraEnabled
    public static void delOpps(Id accountId) {
        if (!Schema.sObjectType.Opportunity.isDeletable()) {
            throw new SecurityException('Insufficient permissions to delete Opportunities.');
        }

        List<Opportunity> oppsToDelete = [
            SELECT Id 
            FROM Opportunity 
            WHERE AccountId = :accountId
        ];

        if (!oppsToDelete.isEmpty()) {
            Database.DeleteResult[] results = Database.delete(oppsToDelete, false);

            for (Database.DeleteResult result : results) {
                if (!result.isSuccess()) {
                    for (Database.Error err : result.getErrors()) {
                        System.debug('Delete failed: ' + err.getMessage());
                        throw new SecurityException('Error deleting opportunities: ' + err.getMessage());
                    }
                }
            }
        }
    }

    @AuraEnabled
    public static void createOpps(Id accountId) {
        if (!Schema.sObjectType.Opportunity.isCreateable()) {
            throw new SecurityException('Insufficient permissions to create Opportunities.');
        }

        List<Opportunity> newOpps = new List<Opportunity>();

        for (Integer i = 1; i <= 10; i++) {
            Opportunity opp = new Opportunity(
                Name = 'New Opportunity ' + i,
                AccountId = accountId,
                CloseDate = Date.today().addMonths(1),
                StageName = 'Prospecting'
            );

            if (!isFieldAccessible(opp, 'Name') || !isFieldAccessible(opp, 'CloseDate') || !isFieldAccessible(opp, 'StageName')) {
                throw new SecurityException('Insufficient field-level permissions.');
            }

            newOpps.add(opp);
        }

        if (!newOpps.isEmpty()) {
            Database.SaveResult[] results = Database.insert(newOpps, false);

            for (Database.SaveResult result : results) {
                if (!result.isSuccess()) {
                    for (Database.Error err : result.getErrors()) {
                        System.debug('Insert failed: ' + err.getMessage());
                        throw new SecurityException('Error inserting some opportunities: ' + err.getMessage());
                    }
                }
            }
        }
    }

    private static Boolean isFieldAccessible(sObject record, String fieldName) {
        return record.getSObjectType().getDescribe().fields.getMap().get(fieldName).getDescribe().isAccessible();
    }
}
