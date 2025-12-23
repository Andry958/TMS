using DataAccess.Data.Enum;


namespace BusinessLogic.DTOs
{
    public class CreateTrackingDto
    {
        public string TtnNumber { get; set; } = null!;
        public TrackingStatus Status { get; set; }

        public DateTime? ShipmentReceivedAt { get; set; }

        public PaymentDayType PaymentDayType { get; set; }
        public int PaymentDaysCount { get; set; }

        public DateTime? PaymentDeadline { get; set; }
        public int? OverdueDays { get; set; }

        public decimal Amount { get; set; }
        public string InvoiceNumber { get; set; } = null!;

        public string Payer { get; set; } = null!;
        public string Vehicle { get; set; } = null!;
        public string Route { get; set; } = null!;
    }
}
