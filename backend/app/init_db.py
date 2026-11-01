"""
Inicializador e Seeder do Banco de Dados - CubeBox Enterprise.
Suporta MySQL (Oracle Cloud / VPS) e SQLite com migrações defensivas.
Popula o catálogo de SKUs com marcas consagradas do varejo brasileiro
(Coca-Cola, Heineken, Red Bull, Nestlé, Camil, Omo, etc.) e clientes no CRM.
"""
from sqlalchemy import text
from backend.app.config import settings
from backend.app.database import SessionLocal, engine, Base, DB_PATH
from backend.app.models import Product, Customer

# Catálogo expandido com marcas reais e consagradas do varejo brasileiro
SKU_CATALOG = [
    # 1. Cervejas
    {"sku": "SKU-BEB-001", "nome": "Cerveja Heineken Puro Malte Lata 350ml", "categoria": "Cervejas", "preco_unitario": 5.90, "custo_unitario": 3.70, "estoque_minimo": 40, "lead_time_dias": 2, "estoque_atual": 65, "status": "ATIVO"},
    {"sku": "SKU-BEB-002", "nome": "Cerveja Colorado Ribeirão Lager 355ml", "categoria": "Cervejas", "preco_unitario": 10.90, "custo_unitario": 6.80, "estoque_minimo": 20, "lead_time_dias": 3, "estoque_atual": 18, "status": "ATIVO"},
    {"sku": "SKU-BEB-003", "nome": "Cerveja Brahma Duplo Malte 600ml", "categoria": "Cervejas", "preco_unitario": 8.90, "custo_unitario": 5.30, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 45, "status": "ATIVO"},
    {"sku": "SKU-BEB-004", "nome": "Cerveja Heineken Long Neck 330ml", "categoria": "Cervejas", "preco_unitario": 7.90, "custo_unitario": 4.90, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 52, "status": "ATIVO"},
    {"sku": "SKU-BEB-005", "nome": "Cerveja Amstel Puro Malte Lata 350ml", "categoria": "Cervejas", "preco_unitario": 4.50, "custo_unitario": 2.80, "estoque_minimo": 35, "lead_time_dias": 2, "estoque_atual": 48, "status": "ATIVO"},
    {"sku": "SKU-BEB-006", "nome": "Cerveja Corona Extra Long Neck 330ml", "categoria": "Cervejas", "preco_unitario": 8.90, "custo_unitario": 5.50, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 36, "status": "ATIVO"},
    {"sku": "SKU-BEB-007", "nome": "Cerveja Stella Artois Pure Gold 330ml", "categoria": "Cervejas", "preco_unitario": 7.50, "custo_unitario": 4.60, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 40, "status": "ATIVO"},
    {"sku": "SKU-BEB-008", "nome": "Cerveja Spaten Puro Malte Long Neck 355ml", "categoria": "Cervejas", "preco_unitario": 7.20, "custo_unitario": 4.40, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 42, "status": "ATIVO"},
    {"sku": "SKU-BEB-009", "nome": "Cerveja Skol Puro Malte Lata 350ml", "categoria": "Cervejas", "preco_unitario": 3.90, "custo_unitario": 2.40, "estoque_minimo": 40, "lead_time_dias": 2, "estoque_atual": 58, "status": "ATIVO"},
    {"sku": "SKU-BEB-010", "nome": "Cerveja Artesanal IPA Goose Island 355ml", "categoria": "Cervejas", "preco_unitario": 13.90, "custo_unitario": 8.50, "estoque_minimo": 15, "lead_time_dias": 3, "estoque_atual": 22, "status": "ATIVO"},

    # 2. Vinhos & Espumantes
    {"sku": "SKU-VIN-001", "nome": "Vinho Chileno Concha y Toro Cabernet Sauvignon 750ml", "categoria": "Vinhos", "preco_unitario": 39.90, "custo_unitario": 24.50, "estoque_minimo": 15, "lead_time_dias": 3, "estoque_atual": 26, "status": "ATIVO"},
    {"sku": "SKU-VIN-002", "nome": "Vinho Argentino DV Catena Malbec 750ml", "categoria": "Vinhos", "preco_unitario": 189.00, "custo_unitario": 125.00, "estoque_minimo": 6, "lead_time_dias": 4, "estoque_atual": 10, "status": "ATIVO"},
    {"sku": "SKU-VIN-003", "nome": "Vinho Chileno Casillero del Diablo Carmenere 750ml", "categoria": "Vinhos", "preco_unitario": 59.90, "custo_unitario": 38.00, "estoque_minimo": 12, "lead_time_dias": 3, "estoque_atual": 18, "status": "ATIVO"},
    {"sku": "SKU-VIN-004", "nome": "Vinho Branco Santa Helena Sauvignon Blanc 750ml", "categoria": "Vinhos", "preco_unitario": 36.90, "custo_unitario": 22.00, "estoque_minimo": 10, "lead_time_dias": 3, "estoque_atual": 16, "status": "ATIVO"},
    {"sku": "SKU-VIN-005", "nome": "Espumante Chandon Réserve Brut 750ml", "categoria": "Vinhos", "preco_unitario": 98.00, "custo_unitario": 64.00, "estoque_minimo": 8, "lead_time_dias": 3, "estoque_atual": 14, "status": "ATIVO"},
    {"sku": "SKU-VIN-006", "nome": "Vinho Verde Casal Garcia 750ml", "categoria": "Vinhos", "preco_unitario": 54.90, "custo_unitario": 35.00, "estoque_minimo": 10, "lead_time_dias": 3, "estoque_atual": 15, "status": "ATIVO"},
    {"sku": "SKU-VIN-007", "nome": "Vinho de Mesa Pérgola Tinto Suave 1L", "categoria": "Vinhos", "preco_unitario": 24.90, "custo_unitario": 15.50, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 28, "status": "ATIVO"},

    # 3. Refrigerantes & Águas
    {"sku": "SKU-REF-001", "nome": "Coca-Cola Original Pet 2L", "categoria": "Refrigerantes", "preco_unitario": 11.50, "custo_unitario": 7.20, "estoque_minimo": 35, "lead_time_dias": 1, "estoque_atual": 48, "status": "ATIVO"},
    {"sku": "SKU-REF-002", "nome": "Guaraná Antarctica Lata 350ml", "categoria": "Refrigerantes", "preco_unitario": 4.50, "custo_unitario": 2.60, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 40, "status": "ATIVO"},
    {"sku": "SKU-REF-003", "nome": "Água Mineral Crystal com Gás 500ml", "categoria": "Refrigerantes", "preco_unitario": 3.20, "custo_unitario": 1.30, "estoque_minimo": 40, "lead_time_dias": 1, "estoque_atual": 85, "status": "ATIVO"},
    {"sku": "SKU-REF-004", "nome": "Coca-Cola Sem Açúcar Pet 2L", "categoria": "Refrigerantes", "preco_unitario": 11.50, "custo_unitario": 7.20, "estoque_minimo": 30, "lead_time_dias": 1, "estoque_atual": 44, "status": "ATIVO"},
    {"sku": "SKU-REF-005", "nome": "Coca-Cola Original Lata 350ml", "categoria": "Refrigerantes", "preco_unitario": 4.90, "custo_unitario": 2.90, "estoque_minimo": 40, "lead_time_dias": 1, "estoque_atual": 62, "status": "ATIVO"},
    {"sku": "SKU-REF-006", "nome": "Coca-Cola Sem Açúcar Lata 350ml", "categoria": "Refrigerantes", "preco_unitario": 4.90, "custo_unitario": 2.90, "estoque_minimo": 35, "lead_time_dias": 1, "estoque_atual": 50, "status": "ATIVO"},
    {"sku": "SKU-REF-007", "nome": "Guaraná Antarctica Pet 2L", "categoria": "Refrigerantes", "preco_unitario": 9.90, "custo_unitario": 6.10, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 38, "status": "ATIVO"},
    {"sku": "SKU-REF-008", "nome": "Guaraná Antarctica Zero Lata 350ml", "categoria": "Refrigerantes", "preco_unitario": 4.50, "custo_unitario": 2.60, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 32, "status": "ATIVO"},
    {"sku": "SKU-REF-009", "nome": "Sprite Lemon Fresh 510ml", "categoria": "Refrigerantes", "preco_unitario": 4.80, "custo_unitario": 2.80, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 28, "status": "ATIVO"},
    {"sku": "SKU-REF-010", "nome": "Fanta Laranja Pet 2L", "categoria": "Refrigerantes", "preco_unitario": 9.50, "custo_unitario": 5.90, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 30, "status": "ATIVO"},
    {"sku": "SKU-REF-011", "nome": "Schweppes Tônica Lata 350ml", "categoria": "Refrigerantes", "preco_unitario": 5.20, "custo_unitario": 3.10, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 34, "status": "ATIVO"},
    {"sku": "SKU-REF-012", "nome": "Schweppes Citrus Lata 350ml", "categoria": "Refrigerantes", "preco_unitario": 5.20, "custo_unitario": 3.10, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 36, "status": "ATIVO"},
    {"sku": "SKU-REF-013", "nome": "Água Mineral Crystal sem Gás 500ml", "categoria": "Refrigerantes", "preco_unitario": 2.80, "custo_unitario": 1.10, "estoque_minimo": 50, "lead_time_dias": 1, "estoque_atual": 95, "status": "ATIVO"},
    {"sku": "SKU-REF-014", "nome": "Suco Integral de Laranja Prats 900ml", "categoria": "Refrigerantes", "preco_unitario": 13.90, "custo_unitario": 8.90, "estoque_minimo": 12, "lead_time_dias": 2, "estoque_atual": 20, "status": "ATIVO"},

    # 4. Energéticos & Isotônicos
    {"sku": "SKU-ENG-001", "nome": "Red Bull Tropical Edition 473ml", "categoria": "Energéticos", "preco_unitario": 13.50, "custo_unitario": 8.20, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 12, "status": "ATIVO"},
    {"sku": "SKU-ENG-002", "nome": "Red Bull Energy Drink Regular 250ml", "categoria": "Energéticos", "preco_unitario": 9.50, "custo_unitario": 5.80, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 50, "status": "ATIVO"},
    {"sku": "SKU-ENG-003", "nome": "Red Bull Sugar Free 250ml", "categoria": "Energéticos", "preco_unitario": 9.50, "custo_unitario": 5.80, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 32, "status": "ATIVO"},
    {"sku": "SKU-ENG-004", "nome": "Monster Energy Tradicional Lata 473ml", "categoria": "Energéticos", "preco_unitario": 10.90, "custo_unitario": 6.60, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 44, "status": "ATIVO"},
    {"sku": "SKU-ENG-005", "nome": "Monster Energy Mango Loco 473ml", "categoria": "Energéticos", "preco_unitario": 10.90, "custo_unitario": 6.60, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 38, "status": "ATIVO"},
    {"sku": "SKU-ENG-006", "nome": "Isotônico Gatorade Tangerina 500ml", "categoria": "Energéticos", "preco_unitario": 6.90, "custo_unitario": 4.10, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 35, "status": "ATIVO"},

    # 5. Destilados & Drinks Prontos
    {"sku": "SKU-DES-001", "nome": "Vodka Smirnoff Red 998ml", "categoria": "Destilados", "preco_unitario": 48.90, "custo_unitario": 31.00, "estoque_minimo": 10, "lead_time_dias": 3, "estoque_atual": 16, "status": "ATIVO"},
    {"sku": "SKU-DES-002", "nome": "Gin Tanqueray London Dry 750ml", "categoria": "Destilados", "preco_unitario": 119.00, "custo_unitario": 78.00, "estoque_minimo": 8, "lead_time_dias": 3, "estoque_atual": 12, "status": "ATIVO"},
    {"sku": "SKU-DES-003", "nome": "Whisky Johnnie Walker Red Label 1L", "categoria": "Destilados", "preco_unitario": 99.90, "custo_unitario": 66.00, "estoque_minimo": 10, "lead_time_dias": 3, "estoque_atual": 15, "status": "ATIVO"},
    {"sku": "SKU-DES-004", "nome": "Whisky Johnnie Walker Black Label 1L", "categoria": "Destilados", "preco_unitario": 189.90, "custo_unitario": 128.00, "estoque_minimo": 6, "lead_time_dias": 4, "estoque_atual": 8, "status": "ATIVO"},
    {"sku": "SKU-DES-005", "nome": "Cachaça Sagatiba Pura 700ml", "categoria": "Destilados", "preco_unitario": 34.90, "custo_unitario": 21.50, "estoque_minimo": 12, "lead_time_dias": 2, "estoque_atual": 20, "status": "ATIVO"},
    {"sku": "SKU-DES-006", "nome": "Skol Beats Senses Long Neck 269ml", "categoria": "Destilados", "preco_unitario": 7.90, "custo_unitario": 4.80, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 45, "status": "ATIVO"},
    {"sku": "SKU-DES-007", "nome": "Mike's Hard Lemonade Long Neck 269ml", "categoria": "Destilados", "preco_unitario": 7.50, "custo_unitario": 4.50, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 38, "status": "ATIVO"},

    # 6. Tabacaria & Cigarros
    {"sku": "SKU-TAB-001", "nome": "Isqueiro Clipper Grande Recarregável", "categoria": "Tabacaria e Afins", "preco_unitario": 7.50, "custo_unitario": 3.60, "estoque_minimo": 15, "lead_time_dias": 3, "estoque_atual": 25, "status": "ATIVO"},
    {"sku": "SKU-TAB-002", "nome": "Seda Smoking King Size Brown", "categoria": "Tabacaria e Afins", "preco_unitario": 6.50, "custo_unitario": 2.90, "estoque_minimo": 20, "lead_time_dias": 3, "estoque_atual": 32, "status": "ATIVO"},
    {"sku": "SKU-TAB-003", "nome": "Cigarro Marlboro Red Box", "categoria": "Tabacaria e Afins", "preco_unitario": 13.00, "custo_unitario": 10.20, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 55, "status": "ATIVO"},
    {"sku": "SKU-TAB-004", "nome": "Cigarro Marlboro Gold Box", "categoria": "Tabacaria e Afins", "preco_unitario": 13.00, "custo_unitario": 10.20, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 50, "status": "ATIVO"},
    {"sku": "SKU-TAB-005", "nome": "Cigarro Dunhill Carlton Blend Box", "categoria": "Tabacaria e Afins", "preco_unitario": 14.50, "custo_unitario": 11.50, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 40, "status": "ATIVO"},
    {"sku": "SKU-TAB-006", "nome": "Cigarro Camel Blue Box", "categoria": "Tabacaria e Afins", "preco_unitario": 11.50, "custo_unitario": 9.10, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 35, "status": "ATIVO"},
    {"sku": "SKU-TAB-007", "nome": "Cigarro de Palha Souza Paiol Tradicional", "categoria": "Tabacaria e Afins", "preco_unitario": 18.00, "custo_unitario": 13.00, "estoque_minimo": 15, "lead_time_dias": 3, "estoque_atual": 24, "status": "ATIVO"},
    {"sku": "SKU-TAB-008", "nome": "Isqueiro BIC Maxi Tradicional", "categoria": "Tabacaria e Afins", "preco_unitario": 6.50, "custo_unitario": 3.20, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 42, "status": "ATIVO"},
    {"sku": "SKU-TAB-009", "nome": "Filtro para Tabaco Papelito Regular c/120", "categoria": "Tabacaria e Afins", "preco_unitario": 8.50, "custo_unitario": 4.20, "estoque_minimo": 15, "lead_time_dias": 3, "estoque_atual": 28, "status": "ATIVO"},

    # 7. Snacks & Salgados
    {"sku": "SKU-SNK-001", "nome": "Batata Ruffles Original 96g", "categoria": "Snacks", "preco_unitario": 8.50, "custo_unitario": 4.90, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 24, "status": "ATIVO"},
    {"sku": "SKU-SNK-002", "nome": "Amendoim Japonês Dori 150g", "categoria": "Snacks", "preco_unitario": 5.50, "custo_unitario": 2.90, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 30, "status": "ATIVO"},
    {"sku": "SKU-SNK-003", "nome": "Salgadinho Doritos Queijo Nacho 84g", "categoria": "Snacks", "preco_unitario": 7.90, "custo_unitario": 4.50, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 14, "status": "ATIVO"},
    {"sku": "SKU-SNK-004", "nome": "Batata Pringles Original 114g", "categoria": "Snacks", "preco_unitario": 14.90, "custo_unitario": 9.50, "estoque_minimo": 12, "lead_time_dias": 3, "estoque_atual": 18, "status": "ATIVO"},
    {"sku": "SKU-SNK-005", "nome": "Salgadinho Cheetos Requeijão 105g", "categoria": "Snacks", "preco_unitario": 6.90, "custo_unitario": 3.80, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 28, "status": "ATIVO"},
    {"sku": "SKU-SNK-006", "nome": "Castanha de Caju Torrada e Salgada 100g", "categoria": "Snacks", "preco_unitario": 12.90, "custo_unitario": 7.50, "estoque_minimo": 10, "lead_time_dias": 3, "estoque_atual": 15, "status": "ATIVO"},
    {"sku": "SKU-SNK-007", "nome": "Torcida Sabor Pimenta Mexicana 70g", "categoria": "Snacks", "preco_unitario": 3.50, "custo_unitario": 1.80, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 35, "status": "ATIVO"},

    # 8. Doces & Chocolates
    {"sku": "SKU-DOC-001", "nome": "Chocolate KitKat Milk 41,5g", "categoria": "Doces", "preco_unitario": 4.50, "custo_unitario": 2.40, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 45, "status": "ATIVO"},
    {"sku": "SKU-DOC-002", "nome": "Bombom Ferrero Rocher com 3 unidades", "categoria": "Doces", "preco_unitario": 11.90, "custo_unitario": 7.20, "estoque_minimo": 15, "lead_time_dias": 3, "estoque_atual": 20, "status": "ATIVO"},
    {"sku": "SKU-DOC-003", "nome": "Barra de Chocolate Milka Ao Leite 100g", "categoria": "Doces", "preco_unitario": 15.90, "custo_unitario": 10.20, "estoque_minimo": 12, "lead_time_dias": 3, "estoque_atual": 16, "status": "ATIVO"},
    {"sku": "SKU-DOC-004", "nome": "Goma de Mascar Trident Menta 25,2g", "categoria": "Doces", "preco_unitario": 3.50, "custo_unitario": 1.70, "estoque_minimo": 40, "lead_time_dias": 1, "estoque_atual": 70, "status": "ATIVO"},
    {"sku": "SKU-DOC-005", "nome": "Pastilha Halls Extra Forte 28g", "categoria": "Doces", "preco_unitario": 2.50, "custo_unitario": 1.10, "estoque_minimo": 40, "lead_time_dias": 1, "estoque_atual": 65, "status": "ATIVO"},
    {"sku": "SKU-DOC-006", "nome": "Chocolate Bis Ao Leite Lacta 126g", "categoria": "Doces", "preco_unitario": 7.50, "custo_unitario": 4.30, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 34, "status": "ATIVO"},

    # 9. Confeitaria & Padaria Express
    {"sku": "SKU-PAD-001", "nome": "Pão de Forma Tradicional Wickbold 500g", "categoria": "Padaria e Matinais", "preco_unitario": 9.90, "custo_unitario": 6.20, "estoque_minimo": 10, "lead_time_dias": 1, "estoque_atual": 14, "status": "ATIVO"},
    {"sku": "SKU-PAD-002", "nome": "Torrada Tradicional Bauducco 142g", "categoria": "Padaria e Matinais", "preco_unitario": 4.90, "custo_unitario": 2.80, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 22, "status": "ATIVO"},
    {"sku": "SKU-PAD-003", "nome": "Bolo de Chocolate Pullman 250g", "categoria": "Padaria e Matinais", "preco_unitario": 8.90, "custo_unitario": 5.10, "estoque_minimo": 10, "lead_time_dias": 2, "estoque_atual": 12, "status": "ATIVO"},

    # 10. Matinais & Café
    {"sku": "SKU-MAT-001", "nome": "Café Torrado e Moído Melitta Tradicional 500g", "categoria": "Padaria e Matinais", "preco_unitario": 19.90, "custo_unitario": 14.50, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 22, "status": "ATIVO"},
    {"sku": "SKU-MAT-002", "nome": "Achocolatado em Pó Nescau 2.0 Nestlé 370g", "categoria": "Padaria e Matinais", "preco_unitario": 8.90, "custo_unitario": 5.80, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 28, "status": "ATIVO"},
    {"sku": "SKU-MAT-003", "nome": "Leite Condensado Moça Lata 395g", "categoria": "Padaria e Matinais", "preco_unitario": 8.50, "custo_unitario": 5.60, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 36, "status": "ATIVO"},
    {"sku": "SKU-MAT-004", "nome": "Creme de Leite Nestlé TP 200g", "categoria": "Padaria e Matinais", "preco_unitario": 4.50, "custo_unitario": 2.80, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 45, "status": "ATIVO"},
    {"sku": "SKU-MAT-005", "nome": "Açúcar Refinado União 1kg", "categoria": "Padaria e Matinais", "preco_unitario": 5.20, "custo_unitario": 3.40, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 32, "status": "ATIVO"},

    # 11. Mercearia Básica & Alimentos
    {"sku": "SKU-ALM-001", "nome": "Arroz Branco Tipo 1 Camil 1kg", "categoria": "Mercearia", "preco_unitario": 6.90, "custo_unitario": 4.50, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 30, "status": "ATIVO"},
    {"sku": "SKU-ALM-002", "nome": "Feijão Carioca Camil 1kg", "categoria": "Mercearia", "preco_unitario": 8.90, "custo_unitario": 5.80, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 26, "status": "ATIVO"},
    {"sku": "SKU-ALM-003", "nome": "Macarrão Espaguete Barilla 500g", "categoria": "Mercearia", "preco_unitario": 5.90, "custo_unitario": 3.60, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 38, "status": "ATIVO"},
    {"sku": "SKU-ALM-004", "nome": "Molho de Tomate Pomarola Tradicional 300g", "categoria": "Mercearia", "preco_unitario": 3.50, "custo_unitario": 1.90, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 44, "status": "ATIVO"},
    {"sku": "SKU-ALM-005", "nome": "Óleo de Soja Liza 900ml", "categoria": "Mercearia", "preco_unitario": 7.90, "custo_unitario": 5.20, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 28, "status": "ATIVO"},
    {"sku": "SKU-ALM-006", "nome": "Atum Sólido ao Natural Gomes da Costa 170g", "categoria": "Mercearia", "preco_unitario": 11.50, "custo_unitario": 7.30, "estoque_minimo": 15, "lead_time_dias": 3, "estoque_atual": 21, "status": "ATIVO"},
    {"sku": "SKU-ALM-007", "nome": "Azeite de Oliva Extra Virgem Gallo 500ml", "categoria": "Mercearia", "preco_unitario": 42.00, "custo_unitario": 31.00, "estoque_minimo": 8, "lead_time_dias": 3, "estoque_atual": 14, "status": "ATIVO"},

    # 12. Laticínios & Frios Refrigerados
    {"sku": "SKU-LAT-001", "nome": "Leite UHT Integral Italac 1L", "categoria": "Laticínios", "preco_unitario": 4.90, "custo_unitario": 3.30, "estoque_minimo": 40, "lead_time_dias": 1, "estoque_atual": 60, "status": "ATIVO"},
    {"sku": "SKU-LAT-002", "nome": "Queijo Mussarela Fatiado Polenghi 150g", "categoria": "Laticínios", "preco_unitario": 9.90, "custo_unitario": 6.40, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 20, "status": "ATIVO"},
    {"sku": "SKU-LAT-003", "nome": "Presunto Cozido Seara Fatiado 200g", "categoria": "Laticínios", "preco_unitario": 8.90, "custo_unitario": 5.50, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 18, "status": "ATIVO"},
    {"sku": "SKU-LAT-004", "nome": "Iogurte Danone Grego Tradicional 90g", "categoria": "Laticínios", "preco_unitario": 3.90, "custo_unitario": 2.20, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 25, "status": "ATIVO"},
    {"sku": "SKU-LAT-005", "nome": "Requeijão Cremoso Catupiry 200g", "categoria": "Laticínios", "preco_unitario": 10.90, "custo_unitario": 6.90, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 22, "status": "ATIVO"},

    # 13. Sorvetes & Sobremesas Geladas
    {"sku": "SKU-SOR-001", "nome": "Picolé Kibon Magnum Clássico 85g", "categoria": "Sorvetes", "preco_unitario": 14.50, "custo_unitario": 8.80, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 22, "status": "ATIVO"},
    {"sku": "SKU-SOR-002", "nome": "Pote de Sorvete Kibon Cremosíssimo Napolitano 1.5L", "categoria": "Sorvetes", "preco_unitario": 29.90, "custo_unitario": 18.50, "estoque_minimo": 8, "lead_time_dias": 2, "estoque_atual": 12, "status": "ATIVO"},
    {"sku": "SKU-SOR-003", "nome": "Picolé Kibon Fruttare Uva 60g", "categoria": "Sorvetes", "preco_unitario": 6.50, "custo_unitario": 3.80, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 30, "status": "ATIVO"},

    # 14. Gelo & Itens de Festa
    {"sku": "SKU-FST-001", "nome": "Saco de Gelo em Cubos Cristal 5kg", "categoria": "Gelo e Festa", "preco_unitario": 14.00, "custo_unitario": 6.50, "estoque_minimo": 15, "lead_time_dias": 1, "estoque_atual": 25, "status": "ATIVO"},
    {"sku": "SKU-FST-002", "nome": "Carvão Vegetal Especial para Churrasco 3kg", "categoria": "Gelo e Festa", "preco_unitario": 19.90, "custo_unitario": 11.50, "estoque_minimo": 10, "lead_time_dias": 2, "estoque_atual": 16, "status": "ATIVO"},
    {"sku": "SKU-FST-003", "nome": "Copo Descartável Transparente 300ml c/50un", "categoria": "Gelo e Festa", "preco_unitario": 5.90, "custo_unitario": 2.90, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 32, "status": "ATIVO"},

    # 15. Higiene Pessoal & Cuidados
    {"sku": "SKU-HIG-001", "nome": "Creme Dental Colgate Total 12 90g", "categoria": "Higiene Pessoal", "preco_unitario": 7.90, "custo_unitario": 4.60, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 30, "status": "ATIVO"},
    {"sku": "SKU-HIG-002", "nome": "Sabonete Dove Original 90g", "categoria": "Higiene Pessoal", "preco_unitario": 4.50, "custo_unitario": 2.60, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 45, "status": "ATIVO"},
    {"sku": "SKU-HIG-003", "nome": "Desodorante Antitranspirante Rexona Men Aerosol 150ml", "categoria": "Higiene Pessoal", "preco_unitario": 15.90, "custo_unitario": 9.80, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 22, "status": "ATIVO"},
    {"sku": "SKU-HIG-004", "nome": "Papel Higiênico Neve Folha Dupla c/4 rolos", "categoria": "Higiene Pessoal", "preco_unitario": 9.90, "custo_unitario": 6.10, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 35, "status": "ATIVO"},

    # 16. Limpeza & Utilidades Domésticas
    {"sku": "SKU-LMP-001", "nome": "Detergente Líquido Ypê Neutro 500ml", "categoria": "Limpeza", "preco_unitario": 2.80, "custo_unitario": 1.45, "estoque_minimo": 40, "lead_time_dias": 2, "estoque_atual": 60, "status": "ATIVO"},
    {"sku": "SKU-LMP-002", "nome": "Sabão em Pó Omo Lavagem Perfeita 800g", "categoria": "Limpeza", "preco_unitario": 15.90, "custo_unitario": 10.50, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 28, "status": "ATIVO"},
    {"sku": "SKU-LMP-003", "nome": "Amaciante Concentrado Comfort Original 500ml", "categoria": "Limpeza", "preco_unitario": 13.90, "custo_unitario": 8.70, "estoque_minimo": 15, "lead_time_dias": 2, "estoque_atual": 24, "status": "ATIVO"},
    {"sku": "SKU-LMP-004", "nome": "Desinfetante Pinho Sol Original 500ml", "categoria": "Limpeza", "preco_unitario": 6.90, "custo_unitario": 4.10, "estoque_minimo": 20, "lead_time_dias": 2, "estoque_atual": 30, "status": "ATIVO"},
    {"sku": "SKU-LMP-005", "nome": "Esponja Multiuso Scotch-Brite 3M", "categoria": "Limpeza", "preco_unitario": 3.20, "custo_unitario": 1.50, "estoque_minimo": 30, "lead_time_dias": 2, "estoque_atual": 50, "status": "ATIVO"},

    # 17. Cuidados Pet
    {"sku": "SKU-PET-001", "nome": "Ração Úmida Pedigree Sachê para Cães Adultos 100g", "categoria": "Pet", "preco_unitario": 3.50, "custo_unitario": 1.95, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 40, "status": "ATIVO"},
    {"sku": "SKU-PET-002", "nome": "Ração Úmida Whiskas Sachê para Gatos 85g", "categoria": "Pet", "preco_unitario": 3.50, "custo_unitario": 1.95, "estoque_minimo": 25, "lead_time_dias": 2, "estoque_atual": 38, "status": "ATIVO"},
    {"sku": "SKU-PET-003", "nome": "Petisco para Cães Dentastix Pedigree Médio", "categoria": "Pet", "preco_unitario": 11.90, "custo_unitario": 7.40, "estoque_minimo": 12, "lead_time_dias": 3, "estoque_atual": 18, "status": "ATIVO"}
]

# Clientes semente para CRM de Balcão e Entregas (com múltiplos endereços na tabela normalizada)
CUSTOMERS_SEED = [
    {"nome": "Douglas Pereira", "cpf_cnpj": "123.456.789-00", "telefone": "(11) 98765-4321", "email": "douglas@empresa.com", "ativo": True},
    {"nome": "Mariana Souza", "cpf_cnpj": "987.654.321-11", "telefone": "(11) 97654-3210", "email": "mariana.souza@gmail.com", "ativo": True},
    {"nome": "Carlos Eduardo Lima", "cpf_cnpj": "456.789.123-22", "telefone": "(11) 96543-2109", "email": "cadu.lima@outlook.com", "ativo": True},
    {"nome": "Beatriz Mendes", "cpf_cnpj": "321.654.987-33", "telefone": "(11) 95432-1098", "email": "bia.mendes@uol.com.br", "ativo": True},
    {"nome": "Mercadinho São Jorge Ltda", "cpf_cnpj": "12.345.678/0001-90", "telefone": "(11) 3322-1100", "email": "contato@saojorge.com.br", "ativo": True},
    {"nome": "Padaria Estrela da Manhã", "cpf_cnpj": "98.765.432/0001-10", "telefone": "(11) 3344-5566", "email": "financeiro@estrelamanha.com.br", "ativo": True},
    {"nome": "Lucas Fernandes", "cpf_cnpj": "234.567.890-44", "telefone": "(11) 94321-0987", "email": "lucas.fernandes@tech.io", "ativo": True},
    {"nome": "Juliana Ribeiro", "cpf_cnpj": "345.678.901-55", "telefone": "(11) 93210-9876", "email": "ju.ribeiro@advogados.com.br", "ativo": True},
    {"nome": "Rafael Albuquerque", "cpf_cnpj": "456.789.012-66", "telefone": "(11) 92109-8765", "email": "rafael.albuquerque@design.com", "ativo": True},
    {"nome": "Bar e Lanches do Zé", "cpf_cnpj": "45.678.901/0001-23", "telefone": "(11) 2233-4455", "email": "bar.ze@yahoo.com.br", "ativo": True}
]


def apply_migrations():
    """
    Garante integridade e criação de tabelas em qualquer dialeto (MySQL ou SQLite).
    A criação oficial das tabelas é delegada ao Base.metadata.create_all(bind=engine).
    """
    # Cria todas as tabelas mapeadas pelos modelos declarativos
    Base.metadata.create_all(bind=engine)

    # Migrações legadas para SQLite se o banco de arquivo já existia previamente
    if settings.is_sqlite and DB_PATH.exists():
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        try:
            # Colunas de products
            cursor.execute("PRAGMA table_info(products)")
            product_cols = [row[1] for row in cursor.fetchall()]
            if product_cols and "status" not in product_cols:
                cursor.execute("ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT 'ATIVO' NOT NULL")

            # Colunas de sales
            cursor.execute("PRAGMA table_info(sales)")
            sales_cols = [row[1] for row in cursor.fetchall()]
            if sales_cols:
                if "customer_id" not in sales_cols:
                    cursor.execute("ALTER TABLE sales ADD COLUMN customer_id INTEGER")
                if "status" not in sales_cols:
                    cursor.execute("ALTER TABLE sales ADD COLUMN status VARCHAR(20) DEFAULT 'CONCLUIDO' NOT NULL")
                if "tipo_entrega" not in sales_cols:
                    cursor.execute("ALTER TABLE sales ADD COLUMN tipo_entrega VARCHAR(20) DEFAULT 'BALCAO' NOT NULL")
                if "taxa_entrega" not in sales_cols:
                    cursor.execute("ALTER TABLE sales ADD COLUMN taxa_entrega REAL DEFAULT 0.0 NOT NULL")
                if "cpf_nota" not in sales_cols:
                    cursor.execute("ALTER TABLE sales ADD COLUMN cpf_nota VARCHAR(20)")
                if "endereco_entrega_snapshot" not in sales_cols:
                    cursor.execute("ALTER TABLE sales ADD COLUMN endereco_entrega_snapshot TEXT")

            conn.commit()
        finally:
            conn.close()


def init_db():
    apply_migrations()
    db = SessionLocal()
    try:
        # 1. Popular ou atualizar produtos
        for item in SKU_CATALOG:
            existing = db.query(Product).filter(Product.sku == item["sku"]).first()
            if existing:
                existing.nome = item["nome"]
                existing.categoria = item["categoria"]
                existing.preco_unitario = item["preco_unitario"]
                existing.custo_unitario = item["custo_unitario"]
                if not hasattr(existing, "status") or existing.status is None:
                    existing.status = "ATIVO"
            else:
                p = Product(**item)
                db.add(p)
        db.commit()
        print(f"[OK] Produtos atualizados com sucesso ({len(SKU_CATALOG)} itens cadastrados)!")

        # 2. Popular clientes caso tabela esteja vazia
        cust_count = db.query(Customer).count()
        if cust_count == 0:
            for c_data in CUSTOMERS_SEED:
                c = Customer(**c_data)
                db.add(c)
            db.commit()
            print(f"[OK] {len(CUSTOMERS_SEED)} clientes cadastrados no CRM de balcão!")
    finally:
        db.close()


if __name__ == '__main__':
    init_db()
