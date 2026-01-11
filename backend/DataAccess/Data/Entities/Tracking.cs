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

        // ТТН
        public string Number { get; set; } = null!;

        // Статус (текст)
        public string Status { get; set; } = null!;

        // Дата доставки (фактична або планова)
        public string? DeliveryDate { get; set; }

        // Отримувач
        public string? RecipientFullName { get; set; }

        // === НОВІ ПОЛЯ ДЛЯ ОПЛАТИ ===

        // Тип днів: "calendar" або "business"
        public string DaysType { get; set; } = "calendar";

        // Кількість днів
        public int DaysCount { get; set; } = 0;

        // Крайній термін оплати
        public DateTime? PaymentDueDate { get; set; }

        // Протермінування (днів)
        public int? OverdueDays { get; set; }

        // Сумма, грн.
        public decimal? Amount { get; set; }

        // № рахунку
        public string? InvoiceNumber { get; set; }

        // Платник
        public string? Payer { get; set; }

        // Транспортний засіб
        public string? Vehicle { get; set; }

        // Маршрут
        public string? Route { get; set; }

        // Відмітка про оплату
        public bool PaymentMark { get; set; }

        public string? RecipientCompany { get; set; }

        public int CompanyId { get; set; }
        public Company Company { get; set; } = null!;
    }
}
