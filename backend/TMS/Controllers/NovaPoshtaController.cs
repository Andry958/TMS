using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace TMS.Controllers
{
    [ApiController]
    [Route("api/novaposhta")]
    public class NovaPoshtaController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private const string NOVA_POSHTA_API_URL = "https://api.novaposhta.ua/v2.0/json/";

        public NovaPoshtaController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        private async Task<string> CallNovaPoshtaApi(object requestBody)
        {
            var client = _httpClientFactory.CreateClient();
            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await client.PostAsync(NOVA_POSHTA_API_URL, content);

            return await response.Content.ReadAsStringAsync();
        }

        #region Контрагенти (Counterparty)

        /// <summary>
        /// Підтягування даних по ЄДРПОУ (8 символів) - створює/знаходить контрагента
        /// </summary>
        [HttpGet("counterparty/by-edrpou")]
        public async Task<IActionResult> GetCounterpartyByEdrpou(
            [FromQuery] string apiKey, 
            [FromQuery] string edrpou)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            if (string.IsNullOrEmpty(edrpou))
            {
                return BadRequest(new { error = "ЄДРПОУ обов'язковий" });
            }

            if (edrpou.Length != 8)
            {
                return BadRequest(new { error = "ЄДРПОУ має містити 8 символів" });
            }

            var requestBody = new
            {
                apiKey,
                modelName = "CounterpartyGeneral",
                calledMethod = "save",
                methodProperties = new
                {
                    CounterpartyType = "Organization",
                    EDRPOU = edrpou,
                    CounterpartyProperty = "Recipient"
                }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            
            // Парсимо відповідь для витягування потрібних даних
            try
            {
                var jsonDocument = JsonDocument.Parse(result);
                var root = jsonDocument.RootElement;

                if (root.TryGetProperty("success", out var successProp) && successProp.GetBoolean())
                {
                    if (root.TryGetProperty("data", out var dataProp) && dataProp.GetArrayLength() > 0)
                    {
                        var firstItem = dataProp[0];
                        
                        var response = new
                        {
                            success = true,
                            companyName = firstItem.TryGetProperty("FirstName", out var firstNameProp) 
                                ? firstNameProp.GetString() 
                                : null,
                            ownershipForm = firstItem.TryGetProperty("OwnershipFormDescription", out var ownershipProp) 
                                ? ownershipProp.GetString() 
                                : null,
                            edrpou = firstItem.TryGetProperty("EDRPOU", out var edrpouProp) 
                                ? edrpouProp.GetString() 
                                : null,
                            counterpartyRef = firstItem.TryGetProperty("Counterparty", out var counterpartyProp) 
                                ? counterpartyProp.GetString() 
                                : null,
                            warnings = root.TryGetProperty("warnings", out var warningsProp) 
                                ? JsonSerializer.Serialize(warningsProp) 
                                : null,
                            rawData = result
                        };

                        return Ok(response);
                    }
                }
                
                return Content(result, "application/json");
            }
            catch
            {
                return Content(result, "application/json");
            }
        }

        /// <summary>
        /// Пошук контрагентів (організацій) по ЄДРПОУ або приватних осіб
        /// </summary>
        [HttpGet("counterparty/search")]
        public async Task<IActionResult> SearchCounterparty(
            [FromQuery] string apiKey, 
            [FromQuery] string? edrpou = null,
            [FromQuery] string? phone = null,
            [FromQuery] int page = 1)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            if (string.IsNullOrEmpty(edrpou) && string.IsNullOrEmpty(phone))
            {
                return BadRequest(new { error = "Потрібен ЄДРПОУ або телефон" });
            }

            var methodProperties = new Dictionary<string, object>
            {
                { "CounterpartyProperty", !string.IsNullOrEmpty(edrpou) ? "Organization" : "PrivatePerson" },
                { "Page", page }
            };

            if (!string.IsNullOrEmpty(edrpou))
            {
                methodProperties.Add("EDRPOU", edrpou);
            }
            if (!string.IsNullOrEmpty(phone))
            {
                methodProperties.Add("Phone", phone);
            }

            var requestBody = new
            {
                apiKey,
                modelName = "Counterparty",
                calledMethod = "getCounterparties",
                methodProperties
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Створення контрагента в Новій Пошті
        /// </summary>
        [HttpPost("counterparty/create")]
        public async Task<IActionResult> CreateCounterparty([FromBody] CreateCounterpartyRequest request)
        {
            if (string.IsNullOrEmpty(request.ApiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            var requestBody = new
            {
                apiKey = request.ApiKey,
                modelName = "Counterparty",
                calledMethod = "save",
                methodProperties = new
                {
                    CounterpartyType = request.CounterpartyType, // Organization або PrivatePerson
                    CounterpartyProperty = request.CounterpartyProperty, // Recipient або Sender
                    
                    // Для організації
                    EDRPOU = request.EDRPOU,
                    OwnershipForm = request.OwnershipForm,
                    CompanyName = request.CompanyName,
                    
                    // Для приватної особи
                    FirstName = request.FirstName,
                    MiddleName = request.MiddleName,
                    LastName = request.LastName,
                    
                    Phone = request.Phone,
                    Email = request.Email
                }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Отримання контактних осіб контрагента
        /// </summary>
        [HttpGet("counterparty/contact-persons")]
        public async Task<IActionResult> GetContactPersons(
            [FromQuery] string apiKey, 
            [FromQuery] string counterpartyRef)
        {
            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(counterpartyRef))
            {
                return BadRequest(new { error = "apiKey та counterpartyRef обов'язкові" });
            }

            var requestBody = new
            {
                apiKey,
                modelName = "Counterparty",
                calledMethod = "getCounterpartyContactPersons",
                methodProperties = new
                {
                    Ref = counterpartyRef,
                    Page = 1
                }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        #endregion

        #region Адреси (Address)

        /// <summary>
        /// Отримання довідника міст (getCities)
        /// </summary>
        [HttpGet("address/cities")]
        public async Task<IActionResult> GetCities(
            [FromQuery] string apiKey,
            [FromQuery] string? findByString = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 1000)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            var methodProperties = new Dictionary<string, object>
            {
                { "Page", page.ToString() },
                { "Limit", limit.ToString() }
            };

            if (!string.IsNullOrEmpty(findByString))
            {
                methodProperties["FindByString"] = findByString;
            }

            var requestBody = new
            {
                apiKey,
                modelName = "AddressGeneral",
                calledMethod = "getCities",
                methodProperties
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Пошук населених пунктів (міст) з автодоповненням
        /// </summary>
        [HttpGet("address/search-settlements")]
        public async Task<IActionResult> SearchSettlements(
            [FromQuery] string apiKey, 
            [FromQuery] string cityName = "",
            [FromQuery] int limit = 20)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            // Якщо cityName пустий, використовуємо getCities
            if (string.IsNullOrWhiteSpace(cityName))
            {
                return await GetCities(apiKey, null, 1, 150);
            }

            var requestBody = new
            {
                apiKey,
                modelName = "Address",
                calledMethod = "searchSettlements",
                methodProperties = new
                {
                    CityName = cityName,
                    Limit = limit
                }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Пошук вулиць у місті
        /// </summary>
        [HttpGet("address/search-streets")]
        public async Task<IActionResult> SearchStreets(
            [FromQuery] string apiKey, 
            [FromQuery] string cityRef,
            [FromQuery] string streetName,
            [FromQuery] int limit = 20)
        {
            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(cityRef) || string.IsNullOrEmpty(streetName))
            {
                return BadRequest(new { error = "apiKey, cityRef та streetName обов'язкові" });
            }

            var requestBody = new
            {
                apiKey,
                modelName = "Address",
                calledMethod = "searchSettlementStreets",
                methodProperties = new
                {
                    StreetName = streetName,
                    SettlementRef = cityRef,
                    Limit = limit
                }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Отримання відділень/поштоматів Нової Пошти
        /// </summary>
        [HttpGet("address/warehouses")]
        public async Task<IActionResult> GetWarehouses(
    [FromQuery] string apiKey,
    [FromQuery] string? cityRef = null,
    [FromQuery] string? cityName = null,
    [FromQuery] string? warehouseType = null, // Branch, Postomat, null = All
    [FromQuery] string? findByString = null,
    [FromQuery] string? warehouseId = null,
    [FromQuery] int page = 1,
    [FromQuery] int limit = 5000)
        {
            if (string.IsNullOrEmpty(apiKey))
                return BadRequest(new { error = "apiKey обов'язковий" });

            var methodProperties = new Dictionary<string, object>
    {
        { "Page", page },
        { "Limit", limit },
        { "Language", "UA" }
    };

            if (!string.IsNullOrEmpty(cityRef))
                methodProperties["CityRef"] = cityRef;

            if (!string.IsNullOrEmpty(cityName))
                methodProperties["CityName"] = cityName;

            if (!string.IsNullOrEmpty(findByString))
                methodProperties["FindByString"] = findByString;

            if (!string.IsNullOrEmpty(warehouseId))
                methodProperties["WarehouseId"] = warehouseId;

            var requestBody = new
            {
                apiKey,
                modelName = "AddressGeneral",
                calledMethod = "getWarehouses",
                methodProperties
            };

            var result = await CallNovaPoshtaApi(requestBody);

            // Якщо не вказано фільтр типу, повертаємо всі відділення
            if (string.IsNullOrEmpty(warehouseType))
                return Content(result, "application/json");

            // Фільтруємо після отримання за CategoryOfWarehouse
            try
            {
                using var doc = JsonDocument.Parse(result);
                var root = doc.RootElement;

                if (!root.GetProperty("success").GetBoolean())
                    return Content(result, "application/json");

                var filteredData = root
                    .GetProperty("data")
                    .EnumerateArray()
                    .Where(w =>
                    {
                        // Для Branch - відділення (не поштомати)
                        if (string.Equals(warehouseType, "Branch", StringComparison.OrdinalIgnoreCase))
                        {
                            if (w.TryGetProperty("CategoryOfWarehouse", out var category))
                            {
                                var categoryValue = category.GetString();
                                // Відділення - все, крім Postomat
                                return categoryValue != "Postomat";
                            }
                            return true; // Якщо немає CategoryOfWarehouse, включаємо
                        }
                        // Для Postomat - тільки поштомати
                        else if (string.Equals(warehouseType, "Postomat", StringComparison.OrdinalIgnoreCase))
                        {
                            if (w.TryGetProperty("CategoryOfWarehouse", out var category))
                            {
                                return category.GetString() == "Postomat";
                            }
                            return false;
                        }
                        return true;
                    })
                    .Select(w => JsonSerializer.Deserialize<object>(w.GetRawText()))
                    .ToList();

                return Ok(new
                {
                    success = true,
                    data = filteredData
                });
            }
            catch (Exception ex)
            {
                // У разі помилки парсингу повертаємо оригінальну відповідь
                Console.WriteLine($"Error filtering warehouses: {ex.Message}");
                return Content(result, "application/json");
            }
        }

        #endregion

        #region Довідники (Common)

        /// <summary>
        /// Отримання форм власності (ТОВ, ПП, ФОП тощо)
        /// </summary>
        [HttpGet("common/ownership-forms")]
        public async Task<IActionResult> GetOwnershipForms([FromQuery] string apiKey)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            var requestBody = new
            {
                apiKey,
                modelName = "Common",
                calledMethod = "getOwnershipFormsList",
                methodProperties = new { }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Отримання типів контрагентів
        /// </summary>
        [HttpGet("common/counterparty-types")]
        public async Task<IActionResult> GetCounterpartyTypes([FromQuery] string apiKey)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            var requestBody = new
            {
                apiKey,
                modelName = "Common",
                calledMethod = "getTypesOfCounterparties",
                methodProperties = new { }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Отримання типів вантажів
        /// </summary>
        [HttpGet("common/cargo-types")]
        public async Task<IActionResult> GetCargoTypes([FromQuery] string apiKey)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            var requestBody = new
            {
                apiKey,
                modelName = "Common",
                calledMethod = "getCargoTypes",
                methodProperties = new { }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Отримання форм оплати
        /// </summary>
        [HttpGet("common/payment-forms")]
        public async Task<IActionResult> GetPaymentForms([FromQuery] string apiKey)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            var requestBody = new
            {
                apiKey,
                modelName = "Common",
                calledMethod = "getPaymentForms",
                methodProperties = new { }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        #endregion

        #region Експрес-накладна (InternetDocument)

        /// <summary>
        /// Розрахунок вартості доставки
        /// </summary>
        [HttpPost("document/calculate-cost")]
        public async Task<IActionResult> CalculateDeliveryCost([FromBody] CalculateCostRequest request)
        {
            if (string.IsNullOrEmpty(request.ApiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            var requestBody = new
            {
                apiKey = request.ApiKey,
                modelName = "InternetDocument",
                calledMethod = "getDocumentPrice",
                methodProperties = new
                {
                    CitySender = request.CitySender,
                    CityRecipient = request.CityRecipient,
                    Weight = request.Weight,
                    ServiceType = request.ServiceType, // WarehouseWarehouse, WarehouseDoors, DoorsWarehouse, DoorsDoors
                    Cost = request.CargoValue,
                    CargoType = request.CargoType,
                    SeatsAmount = request.SeatsAmount
                }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Створення експрес-накладної
        /// </summary>
        [HttpPost("document/create")]
        public async Task<IActionResult> CreateDocument([FromBody] CreateDocumentRequest request)
        {
            if (string.IsNullOrEmpty(request.ApiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            var requestBody = new
            {
                apiKey = request.ApiKey,
                modelName = "InternetDocument",
                calledMethod = "save",
                methodProperties = new
                {
                    PayerType = request.PayerType, // Sender, Recipient
                    PaymentMethod = request.PaymentMethod, // Cash, NonCash
                    DateTime = request.ShipmentDate ?? DateTime.Now.ToString("dd.MM.yyyy"),
                    CargoType = request.CargoType,
                    Weight = request.Weight,
                    ServiceType = request.ServiceType,
                    SeatsAmount = request.SeatsAmount,
                    Description = request.Description,
                    Cost = request.CargoValue,
                    
                    CitySender = request.CitySender,
                    Sender = request.SenderRef,
                    SenderAddress = request.SenderAddressRef,
                    ContactSender = request.ContactSenderRef,
                    SendersPhone = request.SenderPhone,
                    
                    CityRecipient = request.CityRecipient,
                    Recipient = request.RecipientRef,
                    RecipientAddress = request.RecipientAddressRef,
                    ContactRecipient = request.ContactRecipientRef,
                    RecipientsPhone = request.RecipientPhone
                }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Отримання списку експрес-накладних
        /// </summary>
        [HttpGet("document/list")]
        public async Task<IActionResult> GetDocumentList(
            [FromQuery] string apiKey,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 100)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "apiKey обов'язковий" });
            }

            var methodProperties = new Dictionary<string, object>
            {
                { "Page", page },
                { "Limit", limit }
            };

            if (dateFrom.HasValue)
            {
                methodProperties.Add("DateTimeFrom", dateFrom.Value.ToString("dd.MM.yyyy"));
            }
            if (dateTo.HasValue)
            {
                methodProperties.Add("DateTimeTo", dateTo.Value.ToString("dd.MM.yyyy"));
            }

            var requestBody = new
            {
                apiKey,
                modelName = "InternetDocument",
                calledMethod = "getDocumentList",
                methodProperties
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Відстеження ТТН
        /// </summary>
        [HttpGet("document/tracking")]
        public async Task<IActionResult> TrackDocument(
            [FromQuery] string apiKey,
            [FromQuery] string trackingNumber)
        {
            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(trackingNumber))
            {
                return BadRequest(new { error = "apiKey та trackingNumber обов'язкові" });
            }

            var requestBody = new
            {
                apiKey,
                modelName = "TrackingDocument",
                calledMethod = "getStatusDocuments",
                methodProperties = new
                {
                    Documents = new[]
                    {
                        new { DocumentNumber = trackingNumber }
                    }
                }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        /// <summary>
        /// Видалення експрес-накладної
        /// </summary>
        [HttpDelete("document/{documentRef}")]
        public async Task<IActionResult> DeleteDocument(
            [FromQuery] string apiKey,
            [FromRoute] string documentRef)
        {
            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(documentRef))
            {
                return BadRequest(new { error = "apiKey та documentRef обов'язкові" });
            }

            var requestBody = new
            {
                apiKey,
                modelName = "InternetDocument",
                calledMethod = "delete",
                methodProperties = new
                {
                    Ref = documentRef
                }
            };

            var result = await CallNovaPoshtaApi(requestBody);
            return Content(result, "application/json");
        }

        #endregion
    }

    #region Request Models

    public class CreateCounterpartyRequest
    {
        public string ApiKey { get; set; }
        public string CounterpartyType { get; set; } // Organization, PrivatePerson
        public string CounterpartyProperty { get; set; } // Recipient, Sender
        public string? EDRPOU { get; set; }
        public string? OwnershipForm { get; set; }
        public string? CompanyName { get; set; }
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string Phone { get; set; }
        public string? Email { get; set; }
    }

    public class CalculateCostRequest
    {
        public string ApiKey { get; set; }
        public string CitySender { get; set; }
        public string CityRecipient { get; set; }
        public decimal Weight { get; set; }
        public string ServiceType { get; set; }
        public decimal CargoValue { get; set; }
        public string CargoType { get; set; }
        public int SeatsAmount { get; set; } = 1;
    }

    public class CreateDocumentRequest
    {
        public string ApiKey { get; set; }
        public string PayerType { get; set; }
        public string PaymentMethod { get; set; }
        public string? ShipmentDate { get; set; }
        public string CargoType { get; set; }
        public decimal Weight { get; set; }
        public string ServiceType { get; set; }
        public int SeatsAmount { get; set; }
        public string Description { get; set; }
        public decimal CargoValue { get; set; }
        
        public string CitySender { get; set; }
        public string SenderRef { get; set; }
        public string SenderAddressRef { get; set; }
        public string ContactSenderRef { get; set; }
        public string SenderPhone { get; set; }
        
        public string CityRecipient { get; set; }
        public string RecipientRef { get; set; }
        public string RecipientAddressRef { get; set; }
        public string ContactRecipientRef { get; set; }
        public string RecipientPhone { get; set; }
    }

    #endregion
}
