using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.DTOs
{
    public class TrackingDto
    {
        public int Id { get; set; }

        public string TtnNumber { get; set; } = null!;
        public string Status { get; set; } = null!;

        public DateTime? ShipmentReceivedAt { get; set; }

        public string PaymentDayType { get; set; } = null!;
        public int PaymentDaysCount { get; set; }

        public DateTime? PaymentDeadline { get; set; }
        public int? OverdueDays { get; set; }

        public decimal Amount { get; set; }
        public string InvoiceNumber { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;

        public string Payer { get; set; } = null!;
        public string Vehicle { get; set; } = null!;
        public string Route { get; set; } = null!;
    }
}
