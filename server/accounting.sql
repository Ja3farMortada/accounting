-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 25, 2023 at 10:26 PM
-- Server version: 8.0.30
-- PHP Version: 8.0.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `accounting`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_ID` int NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_phone` varchar(15) DEFAULT NULL,
  `customer_address` varchar(100) DEFAULT NULL,
  `dollar_debt` double NOT NULL DEFAULT '0',
  `euro_debt` double NOT NULL DEFAULT '0',
  `lira_debt` double NOT NULL DEFAULT '0',
  `customer_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_ID`, `customer_name`, `customer_phone`, `customer_address`, `dollar_debt`, `euro_debt`, `lira_debt`, `customer_status`) VALUES
(1, 'test', '96170859540', NULL, 1979.4100000000003, 0, 0, 1),
(2, 'حسين ورشة صفد', '96179896886', NULL, 807.3049999999998, 0, 0, 1),
(3, 'تجربة', '96181788987', 'test', -106.4, 0, 0, 1),
(4, 'علي حاريص', '70987654', 'asjldkfas;dl', 595.6500000000001, 0, 0, 1),
(5, 'jaafar', '70846278', 'testing address', 1104.2, 0, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `customers_payments`
--

CREATE TABLE `customers_payments` (
  `payment_ID` int NOT NULL,
  `customer_ID_FK` int NOT NULL,
  `payment_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_account` varchar(10) DEFAULT NULL,
  `payment_currency` varchar(10) NOT NULL,
  `payment_value` double NOT NULL,
  `actual_payment_value` double DEFAULT NULL,
  `exchange_rate` double NOT NULL,
  `euro_rate` double DEFAULT NULL,
  `payment_notes` varchar(100) DEFAULT NULL,
  `payment_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `customers_payments`
--

INSERT INTO `customers_payments` (`payment_ID`, `customer_ID_FK`, `payment_datetime`, `payment_account`, `payment_currency`, `payment_value`, `actual_payment_value`, `exchange_rate`, `euro_rate`, `payment_notes`, `payment_status`) VALUES
(1, 2, '2023-03-20 16:34:47', 'dollar', 'lira', 244, 25000000, 92000, 1.07, NULL, 1),
(2, 2, '2023-03-21 23:01:12', 'dollar', 'dollar', 500, 500, 92000, 1.07, NULL, 1),
(3, 2, '2023-04-29 15:05:10', 'dollar', 'dollar', 1000, 1000, 100000, 1.07, NULL, 1),
(4, 2, '2023-04-29 16:18:09', 'dollar', 'dollar', 13, 13, 100000, 1.07, NULL, 1),
(5, 1, '2023-07-22 11:32:28', 'dollar', 'dollar', 149.85, 149.85, 91000, 1.07, NULL, 1),
(6, 1, '2023-07-23 13:30:07', 'dollar', 'dollar', 400, 400, 91000, 1.07, NULL, 0),
(7, 1, '2023-07-23 15:08:05', 'dollar', 'lira', 193.14, 17500000, 91000, 1.07, NULL, 0),
(8, 1, '2023-07-23 17:00:59', 'dollar', 'dollar', 400, 400, 91000, 1.07, NULL, 0),
(9, 1, '2023-07-23 17:01:29', 'dollar', 'lira', 193.14, 17500000, 91000, 1.07, NULL, 0),
(10, 4, '2023-07-24 17:48:27', 'dollar', 'dollar', 500, 500, 92300, 1.1, NULL, 1),
(11, 4, '2023-07-24 17:49:24', 'dollar', 'lira', 227.1, 17000000, 92300, 1.1, NULL, 1),
(12, 2, '2023-07-24 17:58:33', 'dollar', 'dollar', 122, 122, 92300, 1.1, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `debts_history`
--

CREATE TABLE `debts_history` (
  `record_ID` int NOT NULL,
  `customer_ID_FK` int NOT NULL,
  `item_description` varchar(255) NOT NULL,
  `record_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `qty` int DEFAULT NULL,
  `currency` varchar(10) NOT NULL,
  `exchange_rate` double NOT NULL,
  `unit_cost` double DEFAULT NULL,
  `unit_price` double DEFAULT NULL,
  `record_status` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `invoice_ID` int NOT NULL,
  `user_ID_FK` int DEFAULT NULL,
  `customer_ID_FK` int DEFAULT NULL,
  `invoice_type` varchar(10) NOT NULL,
  `invoice_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `edited_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_cost` double NOT NULL,
  `total_price` double NOT NULL,
  `exchange_rate` double NOT NULL DEFAULT '0',
  `euro_rate` double DEFAULT NULL,
  `invoice_isCompleted` tinyint NOT NULL DEFAULT '0',
  `invoice_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`invoice_ID`, `user_ID_FK`, `customer_ID_FK`, `invoice_type`, `invoice_datetime`, `edited_datetime`, `total_cost`, `total_price`, `exchange_rate`, `euro_rate`, `invoice_isCompleted`, `invoice_status`) VALUES
(5, 1, 1, 'Debt', '2023-03-18 01:37:38', '2023-03-18 01:40:18', 29, 55, 92000, 1.1, 1, 1),
(6, 1, NULL, 'Sale', '2023-03-18 11:17:04', '2023-03-18 11:17:04', 1000, 1990, 92000, 1.1, 1, 1),
(7, 1, 1, 'Debt', '2023-03-18 11:18:37', '2023-03-18 12:25:43', 229, 453, 92000, 1.1, 1, 1),
(8, 1, 1, 'Debt', '2023-03-18 13:13:14', '2023-03-18 13:13:20', 300, 597, 92000, 1.1, 1, 1),
(9, 1, 1, 'Debt', '2023-03-18 23:03:50', '2023-03-18 23:38:33', 397, 782, 92000, 1.1, 1, 1),
(10, 1, 2, 'Debt', '2023-03-18 23:16:42', '2023-03-18 23:17:32', 129, 254, 92000, 1.1, 1, 1),
(11, 1, 1, 'Debt', '2023-03-20 12:45:58', '2023-03-20 16:17:33', 439, 866, 92000, 1.1, 1, 1),
(12, 1, 2, 'Debt', '2023-03-20 13:07:54', '2023-03-25 14:22:21', 1000, 1900, 92000, 1.1, 1, 1),
(13, 1, NULL, 'Sale', '2023-03-20 13:08:02', '2023-03-20 13:08:02', 29, 55, 92000, 1.1, 1, 1),
(14, 1, 3, 'Debt', '2023-03-20 15:58:49', '2023-03-20 15:59:45', 167.2, 304.4, 92000, 1.08, 1, 1),
(15, 1, 3, 'Debt', '2023-03-20 16:25:15', '2023-04-09 14:33:21', 125.56750000000001, 243.13500000000002, 92000, 1.08, 1, 1),
(16, 1, 1, 'Debt', '2023-03-20 16:38:37', '2023-03-20 16:38:49', 347.7025, 689.405, 92000, 1.07, 1, 1),
(17, 1, NULL, 'Sale', '2023-03-24 22:54:27', '2023-03-24 22:54:27', 96.56750000000001, 173, 92000, 1.07, 1, 1),
(18, 1, NULL, 'Sale', '2023-03-25 16:15:09', '2023-03-25 16:15:09', 96.56750000000001, 173.82150000000001, 92000, 1.07, 1, 1),
(19, 1, 2, 'Debt', '2023-03-26 20:37:06', '2023-03-26 20:37:23', 289.7025, 579.405, 110000, 1.07, 1, 1),
(20, 1, 2, 'Debt', '2023-04-28 14:24:20', '2023-07-23 11:55:04', 221.60000000000002, 269, 100000, 1.07, 1, 1),
(26, 1, 2, 'Return', '2023-04-29 13:22:59', '2023-07-23 11:55:07', 196.5675, 383.135, 100000, 1.07, 1, 1),
(27, 1, 1, 'Return', '2023-04-29 13:30:55', '2023-04-29 14:06:37', 96.5675, 193.135, 100000, 1.07, 1, 1),
(28, 1, NULL, 'Sale', '2023-04-29 14:06:52', '2023-04-29 14:06:52', 29, 55, 100000, 1.07, 1, 1),
(30, 1, NULL, 'Return', '2023-04-29 14:17:33', '2023-04-29 14:17:33', 29, 55, 100000, 1.07, 0, 1),
(31, 1, NULL, 'Return', '2023-04-29 14:21:39', '2023-04-29 14:21:39', 96.56750000000001, 193.13500000000002, 100000, 1.07, 0, 1),
(32, 1, NULL, 'Return', '2023-04-29 14:22:26', '2023-04-29 14:22:26', 289.70250000000004, 579.4050000000001, 100000, 1.07, 0, 1),
(33, 1, NULL, 'Sale', '2023-04-29 14:52:23', '2023-04-29 14:52:23', 58, 110, 100000, 1.07, 1, 1),
(34, 1, NULL, 'Sale', '2023-04-29 14:52:38', '2023-04-29 14:52:38', 87, 165, 100000, 1.07, 1, 1),
(35, 1, NULL, 'Return', '2023-04-29 14:52:52', '2023-04-29 14:52:52', 87, 165, 100000, 1.07, 0, 1),
(36, 1, NULL, 'Return', '2023-04-29 14:53:25', '2023-04-29 14:53:25', 87, 165, 100000, 1.07, 0, 1),
(37, 1, NULL, 'Sale', '2023-04-29 14:53:40', '2023-04-29 14:53:40', 87, 165, 100000, 1.07, 1, 1),
(38, 1, NULL, 'Return', '2023-04-29 14:53:51', '2023-04-29 14:53:51', 87, 165, 100000, 1.07, 0, 1),
(39, 1, NULL, 'Sale', '2023-04-29 14:54:45', '2023-04-29 14:54:45', 87, 165, 100000, 1.07, 1, 1),
(40, 1, NULL, 'Return', '2023-04-29 14:54:52', '2023-04-29 14:54:52', 29, 55, 100000, 1.07, 0, 1),
(41, 1, 2, 'Debt', '2023-04-29 17:22:19', '2023-07-23 11:55:09', 116, 220, 100000, 1.07, 1, 0),
(42, 1, 2, 'Return', '2023-07-22 11:14:07', '2023-07-23 11:55:11', 225.5675, 435, 91000, 1.07, 1, 1),
(43, 1, 2, 'Return', '2023-07-22 11:14:56', '2023-07-23 11:54:05', 129, 254, 91000, 1.07, 1, 1),
(44, 1, 1, 'Return', '2023-07-22 11:18:16', '2023-07-23 11:54:22', 96.5675, 193.135, 91000, 1.07, 1, 1),
(45, 1, 1, 'Return', '2023-07-22 11:19:02', '2023-07-23 11:55:13', 96.5675, 193.135, 91000, 1.07, 1, 0),
(46, 1, 3, 'Return', '2023-07-22 11:19:56', '2023-07-23 11:55:15', 20, 35, 91000, 1.07, 1, 0),
(47, 1, 1, 'Return', '2023-07-22 11:20:30', '2023-07-23 11:55:17', 10, 15, 91000, 1.07, 1, 0),
(48, 1, 3, 'Return', '2023-07-22 11:20:51', '2023-07-23 11:55:20', 10, 15, 91000, 1.07, 1, 0),
(49, 1, 3, 'Return', '2023-07-22 11:25:56', '2023-07-23 11:55:22', 10, 20, 91000, 1.07, 1, 0),
(50, 1, 2, 'Return', '2023-07-22 11:28:00', '2023-07-23 11:55:24', 100, 199, 91000, 1.07, 1, 0),
(51, 1, 1, 'Debt', '2023-07-22 11:28:17', '2023-07-24 18:13:53', 289.7025, 579.405, 91000, 1.07, 0, 1),
(52, 1, 3, 'Return', '2023-07-23 11:55:48', '2023-07-23 11:56:51', 272.7675, 522.535, 91000, 1.07, 1, 0),
(53, 1, 2, 'Return', '2023-07-23 11:57:04', '2023-07-23 11:57:04', 354.3, 606, 91000, 1.07, 1, 0),
(54, 1, NULL, 'Sale', '2023-07-23 14:12:37', '2023-07-23 14:12:37', 96.56750000000001, 193.13500000000002, 91000, 1.07, 1, 0),
(55, 1, 3, 'Return', '2023-07-23 15:05:16', '2023-07-23 15:05:16', 29, 50, 91000, 1.07, 1, 0),
(56, 1, NULL, 'Sale', '2023-07-23 15:05:40', '2023-07-23 15:05:40', 96.56750000000001, 193.13500000000002, 91000, 1.07, 1, 0),
(57, 1, NULL, 'Sale', '2023-07-24 17:35:59', '2023-07-24 17:35:59', 187.275, 308.55, 92300, 1.1, 1, 1),
(58, 1, NULL, 'Sale', '2023-07-24 17:37:47', '2023-07-24 17:37:47', 88, 110.00000000000001, 92300, 1.1, 1, 1),
(59, 1, 2, 'Debt', '2023-07-24 17:40:06', '2023-07-24 17:42:58', 1013.1, 1564.2, 92300, 1.1, 1, 1),
(60, 1, 4, 'Debt', '2023-07-24 17:45:09', '2023-07-24 17:47:30', 561.825, 925.6500000000001, 92300, 1.1, 1, 1),
(61, 1, 4, 'Return', '2023-07-24 17:50:13', '2023-07-24 17:50:13', 561.825, 925.6500000000001, 92300, 1.1, 1, 0),
(62, 1, 2, 'Return', '2023-07-24 18:05:14', '2023-07-24 18:05:14', 496.375, 992.75, 92300, 1.1, 1, 1),
(63, 1, 5, 'Debt', '2023-07-25 00:13:10', '2023-07-25 00:13:50', 633.1, 1104.2, 92300, 1.1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `invoice_map`
--

CREATE TABLE `invoice_map` (
  `record_ID` int NOT NULL,
  `invoice_ID_FK` int NOT NULL,
  `item_ID_FK` int NOT NULL,
  `customer_ID_FK` int DEFAULT NULL,
  `record_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `record_type` varchar(10) DEFAULT NULL,
  `qty` int DEFAULT NULL,
  `currency` varchar(10) NOT NULL,
  `exchange_rate` double NOT NULL,
  `euro_rate` double DEFAULT NULL,
  `unit_cost` double DEFAULT NULL,
  `unit_price` double NOT NULL,
  `discount` double NOT NULL DEFAULT '0',
  `discounted_price` double NOT NULL,
  `original_cost` double NOT NULL,
  `original_price` double DEFAULT NULL,
  `record_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `invoice_map`
--

INSERT INTO `invoice_map` (`record_ID`, `invoice_ID_FK`, `item_ID_FK`, `customer_ID_FK`, `record_datetime`, `record_type`, `qty`, `currency`, `exchange_rate`, `euro_rate`, `unit_cost`, `unit_price`, `discount`, `discounted_price`, `original_cost`, `original_price`, `record_status`) VALUES
(16, 5, 4, 1, '2023-03-18 01:40:18', 'Debt', 1, 'dollar', 92000, 1.1, 29, 55, 0, 55, 29, 55, 1),
(17, 6, 1, NULL, '2023-03-18 11:17:04', 'Sale', 10, 'euro', 92000, 1.1, 100, 199, 0, 199, 90, 180, 1),
(30, 7, 1, 1, '2023-03-18 12:25:43', 'Debt', 2, 'euro', 92000, 1.1, 100, 199, 0, 199, 90, 180, 1),
(31, 7, 4, 1, '2023-03-18 12:25:43', 'Debt', 1, 'dollar', 92000, 1.1, 29, 55, 0, 55, 29, 55, 1),
(33, 8, 1, 1, '2023-03-18 13:13:20', 'Debt', 3, 'euro', 92000, 1.1, 100, 199, 0, 199, 90, 180, 1),
(41, 10, 4, 2, '2023-03-18 23:17:32', 'Debt', 1, 'dollar', 92000, 1.1, 29, 55, 0, 55, 29, 55, 1),
(42, 10, 1, 2, '2023-03-18 23:17:32', 'Debt', 1, 'euro', 92000, 1.1, 100, 199, 0, 199, 90, 180, 1),
(43, 9, 1, 1, '2023-03-18 23:38:33', 'Debt', 3, 'euro', 92000, 1.1, 100, 199, 0, 199, 90, 180, 1),
(44, 9, 4, 1, '2023-03-18 23:38:33', 'Debt', 3, 'dollar', 92000, 1.1, 29, 55, 0, 55, 29, 55, 1),
(45, 9, 3, 1, '2023-03-18 23:38:33', 'Debt', 1, 'dollar', 92000, 1.1, 10, 20, 0, 20, 10, 20, 1),
(49, 13, 4, NULL, '2023-03-20 13:08:02', 'Sale', 1, 'dollar', 92000, 1.1, 29, 55, 0, 55, 29, 55, 1),
(61, 14, 3, 3, '2023-03-20 15:59:45', 'Debt', 1, 'dollar', 92000, 1.08, 10, 20, 0, 20, 10, 20, 1),
(62, 14, 6, 3, '2023-03-20 15:59:45', 'Debt', 6, 'dollar', 92000, 1.08, 10, 15, 0, 15, 10, 15, 1),
(63, 14, 1, 3, '2023-03-20 15:59:45', 'Debt', 1, 'euro', 92000, 1.08, 97.2, 194.4, 0, 194.4, 90, 180, 1),
(68, 11, 1, 1, '2023-03-20 16:17:33', 'Debt', 4, 'euro', 92000, 1.1, 100, 199, 0, 199, 90, 180, 1),
(69, 11, 4, 1, '2023-03-20 16:17:33', 'Debt', 1, 'dollar', 92000, 1.1, 29, 55, 0, 55, 29, 55, 1),
(70, 11, 6, 1, '2023-03-20 16:17:33', 'Debt', 1, 'dollar', 92000, 1.08, 10, 15, 0, 15, 10, 15, 1),
(84, 16, 4, 1, '2023-03-20 16:38:49', 'Debt', 2, 'dollar', 92000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(85, 16, 1, 1, '2023-03-20 16:38:49', 'Debt', 3, 'euro', 92000, 1.07, 96.5675, 193.135, 0, 193.135, 90.25, 180.5, 1),
(91, 17, 1, NULL, '2023-03-24 22:54:27', 'Sale', 1, 'euro', 92000, 1.07, 96.56750000000001, 173, 10, 173, 90.25, 180.5, 1),
(98, 12, 1, 2, '2023-03-25 14:22:21', 'Debt', 10, 'euro', 92000, 1.1, 100, 190, 0, 190, 90, 180, 1),
(99, 18, 1, NULL, '2023-03-25 16:15:09', 'Sale', 1, 'euro', 92000, 1.07, 96.56750000000001, 193.13500000000002, 10, 193.13500000000002, 90.25, 180.5, 1),
(107, 15, 4, 3, '2023-03-26 20:36:32', 'Debt', 1, 'dollar', 92000, 1.08, 29, 50, 10, 50, 29, 55, 1),
(108, 15, 1, 3, '2023-03-26 20:36:32', 'Debt', 1, 'euro', 92000, 1.07, 96.56750000000001, 193.13500000000002, 0, 193.13500000000002, 90.25, 180.5, 1),
(110, 19, 1, 2, '2023-03-26 20:37:23', 'Debt', 3, 'euro', 110000, 1.07, 96.5675, 193.135, 0, 193.135, 90.25, 180.5, 1),
(111, 20, 4, 2, '2023-04-28 14:24:20', 'Debt', 1, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(112, 20, 7, 2, '2023-04-28 14:24:20', 'Debt', 2, 'euro', 100000, 1.07, 96.30000000000001, 107, 0, 107, 90, 100, 1),
(113, 26, 1, 2, '2023-04-29 13:22:59', 'Return', 1, 'euro', 100000, 1.07, 96.5675, 193.135, 0, 193.135, 90.25, 180.5, 1),
(114, 26, 1, 2, '2023-04-29 13:22:59', 'Return', 1, 'euro', 100000, 1.07, 100, 190, 0, 190, 90, 180, 1),
(115, 27, 1, 1, '2023-04-29 13:30:55', 'Return', 1, 'euro', 100000, 1.07, 96.5675, 193.135, 0, 193.135, 90.25, 180.5, 1),
(116, 28, 4, NULL, '2023-04-29 14:06:52', 'Sale', 1, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(118, 30, 4, NULL, '2023-04-29 14:17:33', 'Return', 1, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(119, 31, 1, NULL, '2023-04-29 14:21:39', 'Return', 1, 'euro', 100000, 1.07, 96.56750000000001, 193.13500000000002, 0, 193.13500000000002, 90.25, 180.5, 1),
(120, 32, 1, NULL, '2023-04-29 14:22:26', 'Return', 3, 'euro', 100000, 1.07, 96.56750000000001, 193.13500000000002, 0, 193.13500000000002, 90.25, 180.5, 1),
(121, 33, 4, NULL, '2023-04-29 14:52:23', 'Sale', 2, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(122, 34, 4, NULL, '2023-04-29 14:52:38', 'Sale', 3, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(123, 35, 4, NULL, '2023-04-29 14:52:52', 'Return', 3, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(124, 36, 4, NULL, '2023-04-29 14:53:25', 'Return', 3, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(125, 37, 4, NULL, '2023-04-29 14:53:40', 'Sale', 3, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(126, 38, 4, NULL, '2023-04-29 14:53:51', 'Return', 3, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(127, 39, 4, NULL, '2023-04-29 14:54:45', 'Sale', 3, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(128, 40, 4, NULL, '2023-04-29 14:54:52', 'Return', 1, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(131, 41, 4, 2, '2023-07-22 11:13:11', 'Debt', 3, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 0),
(132, 41, 4, 2, '2023-07-22 11:13:11', 'Debt', 1, 'dollar', 100000, 1.07, 29, 55, 0, 55, 29, 55, 0),
(133, 42, 1, 2, '2023-07-22 11:14:07', 'Return', 1, 'euro', 91000, 1.07, 96.5675, 193.135, 0, 190, 90.25, 180.5, 1),
(134, 42, 1, 2, '2023-07-22 11:14:07', 'Return', 1, 'euro', 91000, 1.07, 100, 190, 0, 190, 90, 180, 1),
(135, 42, 4, 2, '2023-07-22 11:14:07', 'Return', 1, 'dollar', 91000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(136, 43, 1, 2, '2023-07-22 11:14:56', 'Return', 1, 'euro', 91000, 1.07, 100, 199, 0, 199, 90, 180, 1),
(137, 43, 4, 2, '2023-07-22 11:14:56', 'Return', 1, 'dollar', 91000, 1.07, 29, 55, 0, 55, 29, 55, 1),
(138, 44, 1, 1, '2023-07-22 11:18:16', 'Return', 1, 'euro', 91000, 1.07, 96.5675, 193.135, 0, 193.135, 90.25, 180.5, 1),
(139, 45, 1, 1, '2023-07-22 11:19:02', 'Return', 1, 'euro', 91000, 1.07, 96.5675, 193.135, 0, 193.135, 90.25, 180.5, 0),
(140, 46, 3, 3, '2023-07-22 11:19:56', 'Return', 1, 'dollar', 91000, 1.07, 10, 20, 0, 20, 10, 20, 0),
(141, 46, 6, 3, '2023-07-22 11:19:56', 'Return', 1, 'dollar', 91000, 1.07, 10, 15, 0, 15, 10, 15, 0),
(142, 47, 6, 1, '2023-07-22 11:20:30', 'Return', 1, 'dollar', 91000, 1.07, 10, 15, 0, 15, 10, 15, 0),
(143, 48, 6, 3, '2023-07-22 11:20:51', 'Return', 1, 'dollar', 91000, 1.07, 10, 15, 0, 15, 10, 15, 0),
(144, 49, 3, 3, '2023-07-22 11:25:56', 'Return', 1, 'dollar', 91000, 1.07, 10, 20, 0, 20, 10, 20, 0),
(145, 50, 1, 2, '2023-07-22 11:28:00', 'Return', 1, 'euro', 91000, 1.07, 100, 199, 0, 199, 90, 180, 0),
(147, 52, 6, 3, '2023-07-23 11:55:48', 'Return', 3, 'dollar', 91000, 1.07, 10, 15, 0, 15, 10, 15, 0),
(148, 52, 3, 3, '2023-07-23 11:55:48', 'Return', 2, 'dollar', 91000, 1.07, 10, 20, 0, 20, 10, 20, 0),
(149, 52, 1, 3, '2023-07-23 11:55:48', 'Return', 1, 'euro', 91000, 1.07, 96.5675, 193.135, 0, 193.135, 90.25, 180.5, 0),
(150, 52, 4, 3, '2023-07-23 11:55:48', 'Return', 1, 'dollar', 91000, 1.07, 29, 50, 0, 50, 29, 55, 0),
(151, 52, 1, 3, '2023-07-23 11:55:48', 'Return', 1, 'euro', 91000, 1.07, 97.2, 194.4, 0, 194.4, 90, 180, 0),
(152, 53, 4, 2, '2023-07-23 11:57:04', 'Return', 1, 'dollar', 91000, 1.07, 29, 55, 0, 55, 29, 55, 0),
(153, 53, 7, 2, '2023-07-23 11:57:04', 'Return', 1, 'euro', 91000, 1.07, 96.3, 107, 0, 107, 90, 100, 0),
(154, 53, 1, 2, '2023-07-23 11:57:04', 'Return', 1, 'euro', 91000, 1.07, 100, 199, 0, 199, 90, 180, 0),
(155, 53, 4, 2, '2023-07-23 11:57:04', 'Return', 1, 'dollar', 91000, 1.07, 29, 55, 0, 55, 29, 55, 0),
(156, 53, 1, 2, '2023-07-23 11:57:04', 'Return', 1, 'euro', 91000, 1.07, 100, 190, 0, 190, 90, 180, 0),
(157, 54, 1, NULL, '2023-07-23 14:12:37', 'Sale', 1, 'euro', 91000, 1.07, 96.56750000000001, 193.13500000000002, 0, 193.13500000000002, 90.25, 180.5, 0),
(158, 55, 4, 3, '2023-07-23 15:05:16', 'Return', 1, 'dollar', 91000, 1.07, 29, 50, 0, 50, 29, 55, 0),
(159, 56, 1, NULL, '2023-07-23 15:05:40', 'Sale', 1, 'euro', 91000, 1.07, 96.56750000000001, 193.13500000000002, 0, 193.13500000000002, 90.25, 180.5, 0),
(160, 57, 1, NULL, '2023-07-24 17:35:59', 'Sale', 1, 'euro', 92300, 1.1, 99.275, 198.55, 0, 198.55, 90.25, 180.5, 1),
(161, 57, 8, NULL, '2023-07-24 17:35:59', 'Sale', 1, 'euro', 92300, 1.1, 88, 110.00000000000001, 0, 110.00000000000001, 80, 100, 1),
(162, 58, 8, NULL, '2023-07-24 17:37:47', 'Sale', 1, 'euro', 92300, 1.1, 88, 110.00000000000001, 0, 110.00000000000001, 80, 100, 1),
(167, 59, 1, 2, '2023-07-24 17:42:53', 'Debt', 4, 'euro', 92300, 1.1, 99.275, 198.55, 0, 198.55, 90.25, 180.5, 1),
(168, 59, 8, 2, '2023-07-24 17:42:53', 'Debt', 7, 'euro', 92300, 1.1, 88, 110, 0, 110, 80, 100, 1),
(173, 60, 1, 4, '2023-07-24 17:45:37', 'Debt', 3, 'euro', 92300, 1.1, 99.275, 198.55, 0, 198.55, 90.25, 180.5, 1),
(174, 60, 8, 4, '2023-07-24 17:45:37', 'Debt', 3, 'euro', 92300, 1.1, 88, 110, 0, 110, 80, 100, 1),
(175, 61, 1, 4, '2023-07-24 17:50:13', 'Return', 3, 'euro', 92300, 1.1, 99.275, 198.55, 0, 198.55, 90.25, 180.5, 0),
(176, 61, 8, 4, '2023-07-24 17:50:13', 'Return', 3, 'euro', 92300, 1.1, 88, 110, 0, 110, 80, 100, 0),
(177, 62, 1, 2, '2023-07-24 18:05:14', 'Return', 5, 'euro', 92300, 1.1, 99.275, 198.55, 0, 198.55, 90.25, 180.5, 1),
(178, 51, 1, 1, '2023-07-24 18:13:53', 'Debt', 3, 'euro', 91000, 1.07, 96.5675, 193.135, 0, 193.135, 90.25, 180.5, 1),
(182, 63, 1, 5, '2023-07-25 00:13:49', 'Debt', 4, 'euro', 92300, 1.1, 99.275, 198.55, 0, 198.55, 90.25, 180.5, 1),
(183, 63, 2, 5, '2023-07-25 00:13:49', 'Debt', 3, 'dollar', 92300, 1.1, 20, 30, 0, 30, 20, 30, 1),
(184, 63, 8, 5, '2023-07-25 00:13:49', 'Debt', 2, 'euro', 92300, 1.1, 88, 110, 0, 110, 80, 100, 1);

-- --------------------------------------------------------

--
-- Table structure for table `reminders`
--

CREATE TABLE `reminders` (
  `reminder_ID` int NOT NULL,
  `reminder_title` varchar(100) NOT NULL,
  `reminder_text` text,
  `reminder_type` varchar(15) NOT NULL DEFAULT 'text',
  `due_date` date DEFAULT NULL,
  `due_time` time DEFAULT NULL,
  `repeat_reminder` varchar(10) DEFAULT NULL,
  `reminder_status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `setting_ID` int NOT NULL,
  `setting_name` varchar(20) NOT NULL,
  `rate_value` double DEFAULT NULL,
  `round_value` int DEFAULT '1',
  `value` varchar(100) DEFAULT NULL,
  `setting_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`setting_ID`, `setting_name`, `rate_value`, `round_value`, `value`, `setting_status`) VALUES
(1, 'exchangeRate', 92300, 1, NULL, 1),
(2, 'exchangeRate2', NULL, NULL, 'MjAyNS0xMi0zMQ==', 1),
(3, 'exchangeRate3', NULL, NULL, 'dW5sb2NrZWQ=', 1),
(4, 'euroRate', 1.1, 1, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `item_ID` int NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `item_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `item_description` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `item_type` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'other',
  `category_ID_FK` int DEFAULT '1',
  `item_sub_category` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `qty` int DEFAULT '0',
  `qty_limit` int DEFAULT '0',
  `currency` varchar(10) NOT NULL DEFAULT 'lira',
  `cost_type` varchar(10) NOT NULL DEFAULT 'normal',
  `percentage_cost` int DEFAULT '0',
  `item_cost` double DEFAULT NULL,
  `average_cost` double DEFAULT '0',
  `item_price` double NOT NULL,
  `item_notes` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `show_on_sell` tinyint(1) NOT NULL DEFAULT '1',
  `item_status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`item_ID`, `barcode`, `item_name`, `item_description`, `item_type`, `category_ID_FK`, `item_sub_category`, `qty`, `qty_limit`, `currency`, `cost_type`, `percentage_cost`, `item_cost`, `average_cost`, `item_price`, `item_notes`, `show_on_sell`, `item_status`) VALUES
(1, '123456', NULL, 'test 1', 'barcode', 1, NULL, 224, 250, 'euro', 'percentage', 50, 90.25, 0, 180.5, NULL, 1, 1),
(2, '654321', NULL, 'dollar test', 'other', 6, NULL, 103, 20, 'dollar', 'normal', 33, 20, 0, 30, NULL, 1, 1),
(3, '111', NULL, 'lira test', 'barcode', 1, NULL, 59, 50, 'dollar', 'normal', 50, 10, 0, 20, NULL, 1, 1),
(4, '123123', NULL, 'dollar', 'barcode', 1, NULL, 14, 10, 'dollar', 'normal', 47, 29, 0, 55, NULL, 1, 1),
(5, NULL, NULL, 'test', 'other', 8, NULL, 20, 10, 'euro', 'percentage', 10, 180, 0, 200, NULL, 1, 1),
(6, NULL, NULL, 'test loading', 'other', 1, NULL, 99, 20, 'dollar', 'normal', 33, 10, 0, 15, NULL, 1, 1),
(7, '123123123', NULL, 'testetstestt', 'barcode', 1, NULL, 99, 10, 'euro', 'percentage', 10, 90, 0, 100, NULL, 1, 1),
(8, '999999', NULL, 'euro test', 'barcode', 1, NULL, 89, 90, 'euro', 'percentage', 20, 80, 0, 100, NULL, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `stock_categories`
--

CREATE TABLE `stock_categories` (
  `category_ID` int NOT NULL,
  `category_index` int DEFAULT NULL,
  `category_name` varchar(50) NOT NULL,
  `show_on_sell` tinyint NOT NULL DEFAULT '1',
  `category_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `stock_categories`
--

INSERT INTO `stock_categories` (`category_ID`, `category_index`, `category_name`, `show_on_sell`, `category_status`) VALUES
(1, 1, 'uncategorized', 1, 1),
(2, NULL, 'test', 1, 0),
(3, 2, 'bayadat', 1, 1),
(4, NULL, 'test 2', 1, 0),
(5, 3, 'Mobile Accessories', 1, 1),
(6, 4, 'Bayadat', 1, 1),
(7, NULL, 'new', 1, 0),
(8, 4, 'testing new', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_ID` int NOT NULL,
  `supplier_name` varchar(100) NOT NULL,
  `supplier_phone` varchar(15) DEFAULT NULL,
  `supplier_address` varchar(100) DEFAULT NULL,
  `dollar_debt` double NOT NULL DEFAULT '0',
  `supplier_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`supplier_ID`, `supplier_name`, `supplier_phone`, `supplier_address`, `dollar_debt`, `supplier_status`) VALUES
(1, 'testing supplier', '96181895996', NULL, 12135.25, 1);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers_payments`
--

CREATE TABLE `suppliers_payments` (
  `payment_ID` int NOT NULL,
  `supplier_ID_FK` int NOT NULL,
  `payment_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_account` varchar(10) DEFAULT NULL,
  `payment_currency` varchar(10) NOT NULL,
  `payment_value` double NOT NULL,
  `actual_payment_value` double DEFAULT NULL,
  `exchange_rate` double NOT NULL,
  `euro_rate` double DEFAULT NULL,
  `payment_notes` varchar(100) DEFAULT NULL,
  `payment_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `suppliers_payments`
--

INSERT INTO `suppliers_payments` (`payment_ID`, `supplier_ID_FK`, `payment_datetime`, `payment_account`, `payment_currency`, `payment_value`, `actual_payment_value`, `exchange_rate`, `euro_rate`, `payment_notes`, `payment_status`) VALUES
(1, 1, '2023-07-22 23:37:41', 'dollar', 'dollar', 693, 693, 91000, 1.07, NULL, 1),
(2, 1, '2023-07-22 23:42:29', 'dollar', 'dollar', 1000, 1000, 91000, 1.07, NULL, 1),
(3, 1, '2023-07-24 18:01:19', 'dollar', 'dollar', 1000, 1000, 92300, 1.1, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `supply_invoice`
--

CREATE TABLE `supply_invoice` (
  `record_ID` int NOT NULL,
  `user_ID_FK` int NOT NULL,
  `supplier_ID_FK` int NOT NULL,
  `invoice_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `invoice_type` varchar(10) NOT NULL,
  `total_cost` double NOT NULL,
  `euro_exchange` double NOT NULL,
  `dollar_exchange` double NOT NULL,
  `record_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `supply_invoice`
--

INSERT INTO `supply_invoice` (`record_ID`, `user_ID_FK`, `supplier_ID_FK`, `invoice_datetime`, `invoice_type`, `total_cost`, `euro_exchange`, `dollar_exchange`, `record_status`) VALUES
(5, 1, 1, '2023-07-22 22:58:34', 'Supply', 90.25, 1.07, 91000, 1),
(6, 1, 1, '2023-07-22 22:58:34', 'Supply', 90.25, 1.07, 91000, 1),
(7, 1, 1, '2023-07-22 22:58:34', 'Supply', 4512.5, 1.07, 91000, 1),
(8, 1, 1, '2023-07-24 18:00:24', 'Supply', 200.5, 1.1, 92300, 1),
(9, 1, 1, '2023-07-24 18:02:51', 'Supply', 90.25, 1.1, 92300, 1),
(10, 1, 1, '2023-07-24 18:04:47', 'Supply', 9025, 1.1, 92300, 1);

-- --------------------------------------------------------

--
-- Table structure for table `supply_invoice_map`
--

CREATE TABLE `supply_invoice_map` (
  `record_ID` int NOT NULL,
  `invoice_ID_FK` int NOT NULL,
  `item_ID_FK` int NOT NULL,
  `qty` int NOT NULL,
  `item_cost` double NOT NULL,
  `currency` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `record_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `supply_invoice_map`
--

INSERT INTO `supply_invoice_map` (`record_ID`, `invoice_ID_FK`, `item_ID_FK`, `qty`, `item_cost`, `currency`, `record_status`) VALUES
(5, 5, 1, 1, 90.25, 'euro', 1),
(6, 6, 1, 1, 90.25, 'euro', 1),
(7, 7, 1, 50, 90.25, 'euro', 1),
(8, 8, 1, 2, 90.25, 'euro', 1),
(9, 8, 2, 1, 20, 'dollar', 1),
(10, 9, 1, 1, 90.25, 'euro', 1),
(11, 10, 1, 100, 90.25, 'euro', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_ID` int NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `type` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'user',
  `owner` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `viewStock` tinyint(1) NOT NULL DEFAULT '0',
  `viewReports` tinyint(1) NOT NULL DEFAULT '0',
  `deleteInvoice` tinyint(1) NOT NULL DEFAULT '0',
  `modifyCustomers` tinyint(1) NOT NULL DEFAULT '0',
  `modifySuppliers` tinyint NOT NULL DEFAULT '0',
  `user_status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_ID`, `username`, `password`, `type`, `owner`, `viewStock`, `viewReports`, `deleteInvoice`, `modifyCustomers`, `modifySuppliers`, `user_status`) VALUES
(1, 'admin', '202cb962ac59075b964b07152d234b70', 'admin', 'admin', 1, 1, 1, 1, 1, 1),
(2, 'user', 'ee11cbb19052e40b07aac0ca060c23ee', 'user', 'user', 1, 0, 0, 1, 1, 1),
(6, 'golf', 'c6cf642b8f1cac1101e23a06aa63600e', 'user', 'safi', 0, 0, 0, 0, 0, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_ID`);

--
-- Indexes for table `customers_payments`
--
ALTER TABLE `customers_payments`
  ADD PRIMARY KEY (`payment_ID`);

--
-- Indexes for table `debts_history`
--
ALTER TABLE `debts_history`
  ADD PRIMARY KEY (`record_ID`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`invoice_ID`);

--
-- Indexes for table `invoice_map`
--
ALTER TABLE `invoice_map`
  ADD PRIMARY KEY (`record_ID`);

--
-- Indexes for table `reminders`
--
ALTER TABLE `reminders`
  ADD PRIMARY KEY (`reminder_ID`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_ID`);

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`item_ID`);

--
-- Indexes for table `stock_categories`
--
ALTER TABLE `stock_categories`
  ADD PRIMARY KEY (`category_ID`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_ID`);

--
-- Indexes for table `suppliers_payments`
--
ALTER TABLE `suppliers_payments`
  ADD PRIMARY KEY (`payment_ID`);

--
-- Indexes for table `supply_invoice`
--
ALTER TABLE `supply_invoice`
  ADD PRIMARY KEY (`record_ID`);

--
-- Indexes for table `supply_invoice_map`
--
ALTER TABLE `supply_invoice_map`
  ADD PRIMARY KEY (`record_ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_ID`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `username_2` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `customers_payments`
--
ALTER TABLE `customers_payments`
  MODIFY `payment_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `debts_history`
--
ALTER TABLE `debts_history`
  MODIFY `record_ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `invoice_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `invoice_map`
--
ALTER TABLE `invoice_map`
  MODIFY `record_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=185;

--
-- AUTO_INCREMENT for table `reminders`
--
ALTER TABLE `reminders`
  MODIFY `reminder_ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `setting_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `item_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `stock_categories`
--
ALTER TABLE `stock_categories`
  MODIFY `category_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `suppliers_payments`
--
ALTER TABLE `suppliers_payments`
  MODIFY `payment_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `supply_invoice`
--
ALTER TABLE `supply_invoice`
  MODIFY `record_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `supply_invoice_map`
--
ALTER TABLE `supply_invoice_map`
  MODIFY `record_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
