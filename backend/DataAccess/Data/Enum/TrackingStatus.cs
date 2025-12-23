using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Data.Enum
{
    public enum TrackingStatus
    {
        Unknown = 0,              // Номер не знайдено
        ShipmentReceived = 1      // Відправлення отримано
    }
    public enum PaymentDayType
    {
        Calendar = 0,     // Календарних
        Banking = 1       // Робочих (банк.)
    }
    public enum PaymentStatus
    {
        NotPaid = 0,
        Paid = 1
    }
}
