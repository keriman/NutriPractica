-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-09-2025 a las 19:15:21
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `nutrition_app`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultations`
--

CREATE TABLE `consultations` (
  `id` varchar(36) NOT NULL,
  `patient_id` varchar(36) NOT NULL,
  `fecha_consulta` date NOT NULL,
  `peso` decimal(5,2) NOT NULL,
  `masa_muscular` decimal(5,2) DEFAULT NULL,
  `grasa_corporal` decimal(5,2) DEFAULT NULL,
  `agua_corporal` decimal(5,2) DEFAULT NULL,
  `masa_osea` decimal(5,2) DEFAULT NULL,
  `metabolismo_basal` decimal(6,2) DEFAULT NULL,
  `presion_arterial_sistolica` int(11) DEFAULT NULL,
  `presion_arterial_diastolica` int(11) DEFAULT NULL,
  `frecuencia_cardiaca` int(11) DEFAULT NULL,
  `temperatura` decimal(4,2) DEFAULT NULL,
  `notas_consulta` text NOT NULL,
  `plan_nutricional` text DEFAULT NULL,
  `proxima_cita` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documents`
--

CREATE TABLE `documents` (
  `id` varchar(36) NOT NULL,
  `patient_id` varchar(36) NOT NULL,
  `consultation_id` varchar(36) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `url` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingredients`
--

CREATE TABLE `ingredients` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `nombre` varchar(200) NOT NULL,
  `calorias_por_100g` decimal(6,2) NOT NULL,
  `proteinas` decimal(5,2) NOT NULL,
  `carbohidratos` decimal(5,2) NOT NULL,
  `grasas` decimal(5,2) NOT NULL,
  `fibra` decimal(5,2) NOT NULL DEFAULT 0.00,
  `categoria` varchar(100) NOT NULL,
  `is_global` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ingredients`
--

INSERT INTO `ingredients` (`id`, `user_id`, `nombre`, `calorias_por_100g`, `proteinas`, `carbohidratos`, `grasas`, `fibra`, `categoria`, `is_global`, `created_at`) VALUES
('00f99ca0-3b0b-4a22-98b8-cdc2259802b6', NULL, 'Aceite de oliva', 884.00, 0.00, 0.00, 100.00, 0.00, 'Grasas', 1, '2025-09-28 16:11:30'),
('1d6546d3-dff2-4e3a-9579-f3530fafa5e4', NULL, 'Quinoa', 120.00, 4.40, 22.00, 1.90, 2.80, 'Cereales', 1, '2025-09-28 16:11:30'),
('54b66a6f-3421-44a8-9734-632909e2661d', NULL, 'Salmón', 208.00, 25.00, 0.00, 12.00, 0.00, 'Proteínas', 1, '2025-09-28 16:11:30'),
('6ea8c103-edea-470f-a7be-d16d322abb2d', NULL, 'Aguacate', 160.00, 2.00, 9.00, 15.00, 7.00, 'Grasas', 1, '2025-09-28 16:11:30'),
('7934b302-ffe0-43fd-a71c-68eed7cf83b9', NULL, 'Arroz blanco', 130.00, 2.70, 28.00, 0.30, 0.40, 'Carbohidratos', 1, '2025-09-28 16:11:30'),
('a01b0b15-dae7-4941-b086-a56a87a53d89', NULL, 'Brócoli', 34.00, 2.80, 7.00, 0.40, 2.60, 'Verduras', 1, '2025-09-28 16:11:30'),
('a98a2a4a-7670-47c3-9a2d-1a528aef5c6f', NULL, 'Espinacas', 23.00, 2.90, 3.60, 0.40, 2.20, 'Verduras', 1, '2025-09-28 16:11:30'),
('f4a58efe-a823-453b-851f-b775914f43bb', NULL, 'Pollo (pechuga)', 165.00, 31.00, 0.00, 3.60, 0.00, 'Proteínas', 1, '2025-09-28 16:11:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `patients`
--

CREATE TABLE `patients` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` enum('masculino','femenino','otro') NOT NULL,
  `altura` int(11) NOT NULL,
  `peso` decimal(5,2) NOT NULL,
  `objetivo_nutricional` text NOT NULL,
  `alergias` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`alergias`)),
  `condiciones_medicas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`condiciones_medicas`)),
  `notas_medicas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `patients`
--

INSERT INTO `patients` (`id`, `user_id`, `nombre`, `apellido`, `email`, `telefono`, `fecha_nacimiento`, `genero`, `altura`, `peso`, `objetivo_nutricional`, `alergias`, `condiciones_medicas`, `notas_medicas`, `created_at`, `updated_at`) VALUES
('89fc777a-bb85-4654-a9e5-0a07e1332e6c', 'f11f6ee9-8865-404d-bda3-87747c605c14', 'Adriana', 'Reynoso', 'adry@gmail.com', '4434785641', '1996-04-14', 'femenino', 165, 52.00, 'Mantenerse en forma', '[]', '[]', '', '2025-09-28 16:16:32', '2025-09-28 16:16:32'),
('fba3d259-965a-400b-9f21-6ea47abd982f', '2b1f27c9-666c-4cde-834f-b579946a5882', 'Test', 'Test', 'paciente@Test.com', '4432567074', '1991-01-01', 'masculino', 172, 80.00, 'Bajar de peso', '[\"Miel\"]', '[\"Hipertrofia muscular\"]', '', '2025-09-28 16:14:45', '2025-09-28 16:14:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recipes`
--

CREATE TABLE `recipes` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `ingredientes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`ingredientes`)),
  `instrucciones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`instrucciones`)),
  `calorias_totales` decimal(7,2) NOT NULL,
  `tiempo_preparacion` int(11) NOT NULL,
  `porciones` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `recipes`
--

INSERT INTO `recipes` (`id`, `user_id`, `nombre`, `descripcion`, `ingredientes`, `instrucciones`, `calorias_totales`, `tiempo_preparacion`, `porciones`, `created_at`) VALUES
('096c0f03-b877-450d-a585-4f00966a4f22', 'd9e09be1-3e23-4b5d-b882-f9f476086caa', 'Pollo Asado con Brócoli al Vapor', 'Delicioso pollo asado acompañado de brócoli al vapor, nutritivo y lleno de sabor.', '[{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":200,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":200,\"unidad\":\"g\",\"nombre\":\"Brócoli\"}]', '[\"Paso 1: Precalienta el horno a 200°C.\",\"Paso 2: Sazona el pollo con sal y pimienta al gusto, colócalo en una bandeja para hornear.\",\"Paso 3: Hornea el pollo durante 25 minutos o hasta que esté cocido.\",\"Paso 4: Paralelamente, hierve agua en una olla, agrega el brócoli y cocina al vapor durante 5-7 minutos.\",\"Paso 5: Sirve el pollo junto al brócoli al vapor.\"]', 448.00, 30, 2, '2025-09-28 16:59:49'),
('140a8cf2-6f36-46c4-9db0-91d35c528a7c', 'd9e09be1-3e23-4b5d-b882-f9f476086caa', 'Arroz Blanco con Pollo Salteado y Brócoli', 'Satisfactorio plato de arroz con pollo y brócoli salteados.', '[{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":300,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":200,\"unidad\":\"g\",\"nombre\":\"Brócoli\"},{\"ingredient_id\":\"7934b302-ffe0-43fd-a71c-68eed7cf83b9\",\"cantidad\":350,\"unidad\":\"g\",\"nombre\":\"Arroz blanco\"}]', '[\"Paso 1: Cocina el arroz blanco según instrucciones del paquete.\",\"Paso 2: Corta el pollo en cubos y saltea en una sartén con un poco de aceite.\",\"Paso 3: Añade el brócoli y cocina todo junto por 5 minutos hasta que el pollo esté bien cocido.\"]', 735.00, 30, 5, '2025-09-28 17:06:13'),
('2307538e-3e6c-49fd-9a2b-9a1a5f438d38', 'f11f6ee9-8865-404d-bda3-87747c605c14', 'Arroz Blanco con Brócoli y Pollo', 'Arroz blanco acompañado de pollo y brócoli, perfecto para un almuerzo saludable.', '[{\"ingredient_id\":\"7934b302-ffe0-43fd-a71c-68eed7cf83b9\",\"cantidad\":200,\"unidad\":\"g\",\"nombre\":\"Arroz blanco\"},{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":300,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":150,\"unidad\":\"g\",\"nombre\":\"Brócoli\"},{\"ingredient_id\":\"00f99ca0-3b0b-4a22-98b8-cdc2259802b6\",\"cantidad\":10,\"unidad\":\"g\",\"nombre\":\"Aceite de oliva\"}]', '[\"Paso 1: Cocina el arroz siguiendo las instrucciones del paquete.\",\"Paso 2: En una sartén, calienta el aceite de oliva y cocina el pollo sazonado hasta que esté dorado.\",\"Paso 3: Añade el brócoli y cocina junto con el pollo hasta que esté tierno.\",\"Paso 4: Mezcla el arroz cocido con el pollo y brócoli antes de servir.\"]', 770.00, 35, 2, '2025-09-28 17:01:58'),
('33f4427a-1ece-44bd-8367-e75d134e4d59', 'd9e09be1-3e23-4b5d-b882-f9f476086caa', 'Pollo al Grill con Arroz y Brócoli', 'Pollo a la parrilla servido con arroz y brócoli, ideal para una comida ligera.', '[{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":180,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"7934b302-ffe0-43fd-a71c-68eed7cf83b9\",\"cantidad\":130,\"unidad\":\"g\",\"nombre\":\"Arroz blanco\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":100,\"unidad\":\"g\",\"nombre\":\"Brócoli\"}]', '[\"Paso 1: Precalienta la parrilla a temperatura media-alta.\",\"Paso 2: Sazona el pollo con especias y colócalo en la parrilla durante 6-8 minutos por cada lado.\",\"Paso 3: Cocina el arroz según las instrucciones del paquete.\",\"Paso 4: Cocina el brócoli al vapor durante 4-5 minutos.\",\"Paso 5: Sirve el pollo a la parrilla con el arroz y el brócoli.\"]', 416.00, 32, 2, '2025-09-28 16:59:50'),
('454a7da0-ea25-4892-b396-ffe480d15586', 'f11f6ee9-8865-404d-bda3-87747c605c14', 'Ensalada de Quinoa y Brócoli', 'Una ensalada fresca y nutritiva con proteínas completas y nutrientes.', '[{\"ingredient_id\":\"1d6546d3-dff2-4e3a-9579-f3530fafa5e4\",\"cantidad\":300,\"unidad\":\"g\",\"nombre\":\"Quinoa\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":250,\"unidad\":\"g\",\"nombre\":\"Brócoli\"},{\"ingredient_id\":\"54b66a6f-3421-44a8-9734-632909e2661d\",\"cantidad\":100,\"unidad\":\"g\",\"nombre\":\"Salmón\"},{\"ingredient_id\":\"6ea8c103-edea-470f-a7be-d16d322abb2d\",\"cantidad\":150,\"unidad\":\"g\",\"nombre\":\"Aguacate\"},{\"ingredient_id\":\"00f99ca0-3b0b-4a22-98b8-cdc2259802b6\",\"cantidad\":20,\"unidad\":\"g\",\"nombre\":\"Aceite de oliva\"}]', '[\"Paso 1: Cocina la quinoa en agua con sal durante 15-20 minutos.\",\"Paso 2: Cocina al vapor el brócoli hasta que esté tierno, unos 5-7 minutos.\",\"Paso 3: Asa el salmón en una sartén durante 6-8 minutos por cada lado.\",\"Paso 4: Mezcla todos los ingredientes en un tazón grande y adereza con aceite de oliva.\"]', 804.00, 35, 5, '2025-09-28 17:09:27'),
('47001bb8-cc4f-4472-b6c9-bd0ff2ead2b4', 'f11f6ee9-8865-404d-bda3-87747c605c14', 'Pollo al Horno con Espinacas', 'Pechuga de pollo jugosa acompañada de espinacas al ajo.', '[{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":500,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"a98a2a4a-7670-47c3-9a2d-1a528aef5c6f\",\"cantidad\":300,\"unidad\":\"g\",\"nombre\":\"Espinacas\"},{\"ingredient_id\":\"00f99ca0-3b0b-4a22-98b8-cdc2259802b6\",\"cantidad\":30,\"unidad\":\"g\",\"nombre\":\"Aceite de oliva\"}]', '[\"Paso 1: Precalienta el horno a 200°C.\",\"Paso 2: Unta las pechugas de pollo con aceite de oliva, sal y pimienta.\",\"Paso 3: Hornea el pollo durante 25-30 minutos hasta que esté dorado.\",\"Paso 4: En una sartén, saltea las espinacas con un poco de aceite y ajo hasta que se marchiten.\"]', 1095.00, 40, 5, '2025-09-28 17:09:28'),
('48d8ae47-2c41-4a09-af5c-6d4ecb70a314', 'f11f6ee9-8865-404d-bda3-87747c605c14', 'Bowl de Espinacas y Salmón', 'Un bowl nutritivo lleno de sabores y colores vivos.', '[{\"ingredient_id\":\"6ea8c103-edea-470f-a7be-d16d322abb2d\",\"cantidad\":200,\"unidad\":\"g\",\"nombre\":\"Aguacate\"},{\"ingredient_id\":\"54b66a6f-3421-44a8-9734-632909e2661d\",\"cantidad\":300,\"unidad\":\"g\",\"nombre\":\"Salmón\"},{\"ingredient_id\":\"a98a2a4a-7670-47c3-9a2d-1a528aef5c6f\",\"cantidad\":200,\"unidad\":\"g\",\"nombre\":\"Espinacas\"},{\"ingredient_id\":\"00f99ca0-3b0b-4a22-98b8-cdc2259802b6\",\"cantidad\":25,\"unidad\":\"g\",\"nombre\":\"Aceite de oliva\"}]', '[\"Paso 1: Cocina el salmón a la parrilla durante 6-8 minutos por cada lado.\",\"Paso 2: Saltea las espinacas con aceite hasta que estén tiernas.\",\"Paso 3: En un bowl, combina el salmón, las espinacas y el aguacate.\",\"Paso 4: Adereza con un poco más de aceite de oliva si lo deseas.\"]', 1262.00, 30, 5, '2025-09-28 17:09:28'),
('647391de-ae02-4bb0-a6ce-9ada1d66544e', 'f11f6ee9-8865-404d-bda3-87747c605c14', 'Quinoa con Verduras Salteadas', 'Nutritiva quinoa con verduras, ideal para una comida ligera.', '[{\"ingredient_id\":\"1d6546d3-dff2-4e3a-9579-f3530fafa5e4\",\"cantidad\":200,\"unidad\":\"g\",\"nombre\":\"Quinoa\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":100,\"unidad\":\"g\",\"nombre\":\"Brócoli\"},{\"ingredient_id\":\"a98a2a4a-7670-47c3-9a2d-1a528aef5c6f\",\"cantidad\":100,\"unidad\":\"g\",\"nombre\":\"Espinacas\"},{\"ingredient_id\":\"00f99ca0-3b0b-4a22-98b8-cdc2259802b6\",\"cantidad\":10,\"unidad\":\"g\",\"nombre\":\"Aceite de oliva\"}]', '[\"Paso 1: Cocina la quinoa siguiendo las instrucciones del paquete.\",\"Paso 2: En una sartén, calienta el aceite de oliva y añade el brócoli y las espinacas.\",\"Paso 3: Saltea las verduras hasta que estén tiernas.\",\"Paso 4: Mezcla las verduras salteadas con la quinoa cocida antes de servir.\"]', 576.00, 30, 2, '2025-09-28 17:01:58'),
('ae5f7e4c-ce25-4b5f-84eb-069c437868bc', 'f11f6ee9-8865-404d-bda3-87747c605c14', 'Pechuga de Pollo a la Parrilla con Guacamole', 'Deliciosa pechuga de pollo a la parrilla acompañada de cremoso guacamole.', '[{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":300,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"6ea8c103-edea-470f-a7be-d16d322abb2d\",\"cantidad\":150,\"unidad\":\"g\",\"nombre\":\"Aguacate\"},{\"ingredient_id\":\"00f99ca0-3b0b-4a22-98b8-cdc2259802b6\",\"cantidad\":10,\"unidad\":\"g\",\"nombre\":\"Aceite de oliva\"}]', '[\"Paso 1: Precalienta la parrilla a temperatura media-alta.\",\"Paso 2: Sazona el pollo con sal y pimienta y úntalo con aceite de oliva.\",\"Paso 3: Asa el pollo durante 6-7 minutos por cada lado hasta que esté bien cocido.\",\"Paso 4: Tritura el aguacate con un tenedor, añade sal y limón al gusto para hacer el guacamole.\",\"Paso 5: Sirve el pollo caliente con el guacamole.\"]', 724.00, 30, 2, '2025-09-28 17:01:58'),
('b46ad871-ade0-4259-809e-2a28df2e1320', 'd9e09be1-3e23-4b5d-b882-f9f476086caa', 'Ensalada de Pollo y Brócoli con Arroz', 'Fresca ensalada de pollo y brócoli con arroz, perfecta para un almuerzo ligero.', '[{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":150,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":100,\"unidad\":\"g\",\"nombre\":\"Brócoli\"},{\"ingredient_id\":\"7934b302-ffe0-43fd-a71c-68eed7cf83b9\",\"cantidad\":100,\"unidad\":\"g\",\"nombre\":\"Arroz blanco\"}]', '[\"Paso 1: Cocina el pollo a la plancha, luego enfríalo y córtalo en tiras.\",\"Paso 2: Cocina el arroz y enfríalo.\",\"Paso 3: Cocina el brócoli al vapor y enfría.\",\"Paso 4: Mezcla el pollo, el brócoli y el arroz en un bol.\",\"Paso 5: Puedes agregar un poco de limón o vinagre para aderezar.\"]', 397.00, 20, 2, '2025-09-28 16:59:50'),
('b6869365-9709-435a-9eff-4bbd0ad3ca4a', 'd9e09be1-3e23-4b5d-b882-f9f476086caa', 'Pechuga de Pollo al Horno con Brócoli y Arroz', 'Pechuga al horno acompañada de brócoli y arroz saludable.', '[{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":400,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":200,\"unidad\":\"g\",\"nombre\":\"Brócoli\"},{\"ingredient_id\":\"7934b302-ffe0-43fd-a71c-68eed7cf83b9\",\"cantidad\":250,\"unidad\":\"g\",\"nombre\":\"Arroz blanco\"}]', '[\"Paso 1: Precalienta el horno a 180°C.\",\"Paso 2: Coloca la pechuga en una bandeja y sazona con tus especias favoritas.\",\"Paso 3: Hornea por 25-30 minutos. Cocina el brócoli al vapor y el arroz aparte.\"]', 640.00, 35, 5, '2025-09-28 17:06:13'),
('c15543cf-618c-4ad5-aece-963927fd7ee9', 'd9e09be1-3e23-4b5d-b882-f9f476086caa', 'Bol de Arroz con Pollo y Brócoli', 'Fresco bol de arroz con pollo y brócoli en una sola preparación.', '[{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":300,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":300,\"unidad\":\"g\",\"nombre\":\"Brócoli\"},{\"ingredient_id\":\"7934b302-ffe0-43fd-a71c-68eed7cf83b9\",\"cantidad\":250,\"unidad\":\"g\",\"nombre\":\"Arroz blanco\"}]', '[\"Paso 1: Cocina el arroz como de costumbre.\",\"Paso 2: Corta el pollo y brócoli, saltéalos en la misma sartén hasta que el pollo esté dorado.\",\"Paso 3: Mezcla el arroz cocido con el pollo y el brócoli.\"]', 700.00, 25, 5, '2025-09-28 17:06:13'),
('df27f2e6-4691-4251-a5fb-c1dadd389a09', 'f11f6ee9-8865-404d-bda3-87747c605c14', 'Arroz con Aguacate y Pollo', 'Arroz blanco servido con suculenta pechuga de pollo y aguacate cremoso.', '[{\"ingredient_id\":\"7934b302-ffe0-43fd-a71c-68eed7cf83b9\",\"cantidad\":500,\"unidad\":\"g\",\"nombre\":\"Arroz blanco\"},{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":350,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"6ea8c103-edea-470f-a7be-d16d322abb2d\",\"cantidad\":200,\"unidad\":\"g\",\"nombre\":\"Aguacate\"},{\"ingredient_id\":\"00f99ca0-3b0b-4a22-98b8-cdc2259802b6\",\"cantidad\":20,\"unidad\":\"g\",\"nombre\":\"Aceite de oliva\"}]', '[\"Paso 1: Cocina el arroz en agua con sal durante 18-20 minutos.\",\"Paso 2: Asa el pollo en una sartén con aceite hasta que esté dorado y cocido.\",\"Paso 3: Corta el aguacate en rodajas.\",\"Paso 4: Sirve el arroz como base, coloca el pollo y el aguacate encima.\"]', 1095.00, 35, 5, '2025-09-28 17:09:28'),
('e80091d1-05dd-4f90-b0ed-b3af58121e42', 'f11f6ee9-8865-404d-bda3-87747c605c14', 'Ensalada de Espinacas y Salmón', 'Fresca ensalada de espinacas con delicioso salmón a la plancha.', '[{\"ingredient_id\":\"a98a2a4a-7670-47c3-9a2d-1a528aef5c6f\",\"cantidad\":100,\"unidad\":\"g\",\"nombre\":\"Espinacas\"},{\"ingredient_id\":\"54b66a6f-3421-44a8-9734-632909e2661d\",\"cantidad\":200,\"unidad\":\"g\",\"nombre\":\"Salmón\"},{\"ingredient_id\":\"00f99ca0-3b0b-4a22-98b8-cdc2259802b6\",\"cantidad\":10,\"unidad\":\"g\",\"nombre\":\"Aceite de oliva\"}]', '[\"Paso 1: Cocina el salmón en una sartén con el aceite de oliva hasta que esté dorado por ambos lados.\",\"Paso 2: En un plato, coloca las espinacas frescas.\",\"Paso 3: Corta el salmón en trozos y añádelo sobre las espinacas.\",\"Paso 4: Aliña la ensalada con aceite de oliva y sal al gusto.\"]', 638.00, 25, 2, '2025-09-28 17:01:58'),
('ee795472-1fb2-4928-9ecd-5c0268b03769', 'd9e09be1-3e23-4b5d-b882-f9f476086caa', 'Salteado de Pollo y Brócoli con Arroz', 'Sabroso salteado de pollo y brócoli servido sobre una cama de arroz blanco.', '[{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":150,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":150,\"unidad\":\"g\",\"nombre\":\"Brócoli\"},{\"ingredient_id\":\"7934b302-ffe0-43fd-a71c-68eed7cf83b9\",\"cantidad\":150,\"unidad\":\"g\",\"nombre\":\"Arroz blanco\"}]', '[\"Paso 1: Cocina el arroz según las instrucciones del paquete.\",\"Paso 2: Corta el pollo en trozos y saltea en una sartén caliente con un poco de agua.\",\"Paso 3: Agrega el brócoli y cocina hasta que se ablande.\",\"Paso 4: Sirve el salteado de pollo y brócoli sobre el arroz blanco cocido.\"]', 470.00, 25, 2, '2025-09-28 16:59:50'),
('efbb5c3d-7002-48c1-ae96-d996bef7cca0', 'd9e09be1-3e23-4b5d-b882-f9f476086caa', 'Pechuga de Pollo a la Parrilla con Brócoli', 'Deliciosa pechuga de pollo marinada y brócoli al vapor.', '[{\"ingredient_id\":\"f4a58efe-a823-453b-851f-b775914f43bb\",\"cantidad\":300,\"unidad\":\"g\",\"nombre\":\"Pollo (pechuga)\"},{\"ingredient_id\":\"a01b0b15-dae7-4941-b086-a56a87a53d89\",\"cantidad\":250,\"unidad\":\"g\",\"nombre\":\"Brócoli\"}]', '[\"Paso 1: Marina la pechuga de pollo con especias al gusto.\",\"Paso 2: Asa la pechuga en la parrilla a fuego medio por 6-7 minutos cada lado.\",\"Paso 3: Cocina el brócoli al vapor por 5-6 minutos hasta que esté tierno.\"]', 570.00, 20, 5, '2025-09-28 17:06:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `apellido`, `email`, `password_hash`, `telefono`, `especialidad`, `created_at`, `updated_at`) VALUES
('2b1f27c9-666c-4cde-834f-b579946a5882', 'Test', 'User', 'test@test.com', '$2b$12$oMd3yRVyH7KA.s5unLMd3e5UVkSzEUlQndORC9NfMR6DouuKbeRZu', NULL, 'Nutricionista', '2025-09-28 16:11:42', '2025-09-28 16:11:42'),
('d9e09be1-3e23-4b5d-b882-f9f476086caa', 'Test', 'User', 'test@nutricionista.com', '$2b$12$s83IKZnvYObJIWCNaUEOj.eX2DC3MbSGyKwyLew.9axSJjPCA3LRC', NULL, NULL, '2025-09-28 16:59:12', '2025-09-28 16:59:12'),
('f11f6ee9-8865-404d-bda3-87747c605c14', 'Edson', 'Barrera', 'edsonkeri@hotmail.com', '$2b$12$CgSc6eK6Fjsjnuf/Uv/XBeeXtelBdvd2LDfUHjHzxBP1rDxaegYV2', '4431662335', NULL, '2025-09-28 16:15:17', '2025-09-28 16:15:17');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `consultations`
--
ALTER TABLE `consultations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_patient_id` (`patient_id`),
  ADD KEY `idx_fecha_consulta` (`fecha_consulta`);

--
-- Indices de la tabla `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_patient_id` (`patient_id`),
  ADD KEY `idx_consultation_id` (`consultation_id`);

--
-- Indices de la tabla `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_nombre` (`nombre`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_global` (`is_global`);

--
-- Indices de la tabla `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_email` (`user_id`,`email`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indices de la tabla `recipes`
--
ALTER TABLE `recipes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_nombre` (`nombre`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `consultations`
--
ALTER TABLE `consultations`
  ADD CONSTRAINT `consultations_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`consultation_id`) REFERENCES `consultations` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `ingredients`
--
ALTER TABLE `ingredients`
  ADD CONSTRAINT `ingredients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `recipes`
--
ALTER TABLE `recipes`
  ADD CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
