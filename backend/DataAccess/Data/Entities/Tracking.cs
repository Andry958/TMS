using DataAccess.Data.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DataAccess.Data.Entities
{
    public class Tracking : BaseEntity
    {
        public int Id { get; set; }
        public string Number { get; set; }
        public string StatusCode { get; set; }
        public string DateCreated { get; set; }
        public string Status { get; set; }
        public string RefEW { get; set; }

        public string RecipientDateTime { get; set; }

        public string CargoType { get; set; }
        public string CargoDescriptionString { get; set; }

        public string DocumentCost { get; set; }
        public decimal AnnouncedPrice { get; set; }

        public double DocumentWeight { get; set; }
        public double CheckWeight { get; set; }
        public string CalculatedWeight { get; set; }
        public string CheckWeightMethod { get; set; }
        public string FactualWeight { get; set; }
        public string VolumeWeight { get; set; }

        public string SeatsAmount { get; set; }
        public string ServiceType { get; set; }

        // ----- Sender -----
        public string CitySender { get; set; }
        public string CounterpartySenderDescription { get; set; }
        public string CounterpartySenderType { get; set; }
        public string PhoneSender { get; set; }
        public string SenderAddress { get; set; }
        public string SenderFullNameEW { get; set; }
        public string WarehouseSender { get; set; }

        // ----- Recipient -----
        public string CityRecipient { get; set; }
        public string CounterpartyRecipientDescription { get; set; }
        public string PhoneRecipient { get; set; }
        public string RecipientAddress { get; set; }
        public string RecipientFullName { get; set; }
        public string WarehouseRecipient { get; set; }
        [JsonConverter(typeof(IntNullableJsonConverter))]
        public int? WarehouseRecipientNumber { get; set; }

        // ----- Payment -----
        public string PayerType { get; set; }
        public string PaymentMethod { get; set; }
        public string ExpressWaybillPaymentStatus { get; set; }
        public string ExpressWaybillAmountToPay { get; set; }

        // ----- Dates -----
        public string ScheduledDeliveryDate { get; set; }
        public string ActualDeliveryDate { get; set; }
        public string DateScan { get; set; }
        public string TrackingUpdateDate { get; set; }

        // ----- Flags -----
        public bool CargoReturnRefusal { get; set; }
        public bool SecurePayment { get; set; }

        // ----- Permissions -----
        public bool PossibilityCreateClaim { get; set; }
        public bool PossibilityCreateReturn { get; set; }
    }
}
