using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Data.Enum
{
    public enum CurrencyCode
    {
        UAH = 980,
        AUD = 36,
        AZN = 944,
        DZD = 12,
        THB = 764,
        BGN = 975,
        KRW = 410,
        HKD = 344,
        DKK = 208,
        AED = 784,
        USD = 840,
        VND = 704,
        EUR = 978,
        EGP = 818,
        JPY = 392,
        PLN = 985,
        INR = 356,
        CAD = 124,
        GEL = 981,
        LBP = 422,
        MYR = 458,
        MXN = 484,
        MDL = 498,
        ILS = 376,
        NZD = 554,
        NOK = 578,
        ZAR = 710,
        RON = 946,
        IDR = 360,
        SAR = 682,
        RSD = 941,
        SGD = 702,
        BDT = 50,
        KZT = 398,
        TND = 788,
        TRY = 949,
        HUF = 348,
        GBP = 826,
        CZK = 203,
        SEK = 752,
        CHF = 756,
        CNY = 156,
        XDR = 960
    }

    // Додаткові дані для валюти
    public class CurrencyInfo
    {
        public CurrencyCode Code { get; set; }
        public string LetterCode { get; set; } = "";
        public int Units { get; set; }
        public string Name { get; set; } = "";
        public decimal OfficialRate { get; set; }
    }

    //// Приклад використання
    //var usdInfo = new CurrencyInfo
    //{
    //    Code = CurrencyCode.USD,
    //    LetterCode = "USD",
    //    Units = 1,
    //    Name = "Долар США",
    //    OfficialRate = 42.3374m
    //};

}
