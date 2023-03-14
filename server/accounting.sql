-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 14, 2023 at 09:11 PM
-- Server version: 8.0.26
-- PHP Version: 7.4.29

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
(1, 'hadi', '96170856584', 'test', 830, 180, 900000, 1),
(2, 'test 2', '9613568548', NULL, 680, 55, 800000, 1),
(3, 'new test', '9613658458', NULL, 60.9, 18, 0, 1);

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
(1, 1, '2023-03-09 17:23:28', 'sayrafa', 'lira', 20, 1400000, 80000, 70000, NULL, 1),
(2, 2, '2023-03-09 18:43:48', 'dollar', 'lira', 100, 8000000, 80000, 70000, NULL, 1),
(3, 2, '2023-03-09 18:45:55', 'sayrafa', 'dollar', 5, 3, 80000, 70000, NULL, 1),
(4, 2, '2023-03-09 19:33:51', 'lira', 'lira', 100000, 100000, 80000, 70000, NULL, 1),
(5, 2, '2023-03-09 21:49:56', 'sayrafa', 'lira', 15, 1050000, 80000, 70000, NULL, 1),
(6, 2, '2023-03-09 21:56:09', 'lira', 'lira', 100000, 100000, 80000, 70000, NULL, 1),
(7, 2, '2023-03-09 22:06:42', 'sayrafa', 'lira', 10, 700000, 80000, 70000, NULL, 1),
(8, 2, '2023-03-09 22:12:25', 'lira', 'lira', 100000, 100000, 80000, 70000, NULL, 1),
(9, 1, '2023-03-09 22:12:50', 'dollar', 'dollar', 80, 80, 80000, 70000, NULL, 1),
(10, 1, '2023-03-09 22:13:32', 'sayrafa', 'dollar', 5, 4.5, 80000, 70000, NULL, 1),
(11, 2, '2023-03-12 00:28:04', 'lira', 'lira', 100000, 100000, 91000, 70000, NULL, 1),
(12, 1, '2023-03-12 14:34:27', 'dollar', 'dollar', 62, 62, 92000, 70000, NULL, 1),
(13, 1, '2023-03-12 14:34:58', 'sayrafa', 'dollar', 45, 30, 92000, 70000, NULL, 1),
(14, 1, '2023-03-12 14:35:22', 'dollar', 'lira', 100, 8000000, 92000, 70000, NULL, 1);

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
(1, 1, 1, 'Debt', '2023-03-14 20:38:30', '2023-03-14 20:38:30', 158, 309, 92000, 1.1, 0, 1);

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
  `original_cost` double NOT NULL,
  `original_price` double DEFAULT NULL,
  `record_status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `invoice_map`
--

INSERT INTO `invoice_map` (`record_ID`, `invoice_ID_FK`, `item_ID_FK`, `customer_ID_FK`, `record_datetime`, `record_type`, `qty`, `currency`, `exchange_rate`, `euro_rate`, `unit_cost`, `unit_price`, `original_cost`, `original_price`, `record_status`) VALUES
(1, 1, 1, 1, '2023-03-14 20:38:30', 'Debt', 1, 'euro', 92000, 1.1, 100, 199, 90, 180, 1),
(2, 1, 4, 1, '2023-03-14 20:38:30', 'Debt', 2, 'dollar', 92000, 1.1, 29, 55, 29, 55, 1);

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
(1, 'exchangeRate', 92000, 1, NULL, 1),
(2, 'exchangeRate2', NULL, NULL, 'MjAyMy0wNS0wMQ==', 1),
(3, 'exchangeRate3', NULL, NULL, 'dW5sb2NrZWQ=', 1),
(4, 'euroRate', 1.1, 1, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `item_ID` int NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `item_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `item_description` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `item_type` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'other',
  `category_ID_FK` int DEFAULT '1',
  `item_sub_category` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `qty` int DEFAULT '0',
  `qty_limit` int DEFAULT '0',
  `currency` varchar(10) NOT NULL DEFAULT 'lira',
  `cost_type` varchar(10) NOT NULL DEFAULT 'normal',
  `percentage_cost` int DEFAULT '0',
  `item_cost` double DEFAULT NULL,
  `average_cost` double DEFAULT '0',
  `item_price` double NOT NULL,
  `item_notes` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `show_on_sell` tinyint(1) NOT NULL DEFAULT '1',
  `item_status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`item_ID`, `barcode`, `item_name`, `item_description`, `item_type`, `category_ID_FK`, `item_sub_category`, `qty`, `qty_limit`, `currency`, `cost_type`, `percentage_cost`, `item_cost`, `average_cost`, `item_price`, `item_notes`, `show_on_sell`, `item_status`) VALUES
(1, '123456', NULL, 'test 1', 'barcode', 1, NULL, 100, 10, 'euro', 'percentage', 50, 90, 0, 180, NULL, 1, 1),
(2, NULL, NULL, 'dollar test', 'other', 6, NULL, 105, 20, 'dollar', 'normal', 33, 20, 0, 30, NULL, 1, 0),
(3, NULL, NULL, 'lira test', 'other', 1, NULL, 20, 50, 'lira', 'percentage', 30, 700000, 0, 1000000, NULL, 1, 1),
(4, '123123', NULL, 'dollar', 'barcode', 1, NULL, 20, 10, 'dollar', 'normal', 47, 29, 0, 55, NULL, 1, 1);

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
(3, 2, 'Networking', 1, 1),
(4, NULL, 'test 2', 1, 0),
(5, 3, 'Mobile Accessories', 1, 1),
(6, 4, 'Cables', 1, 1),
(7, NULL, 'new', 1, 0),
(8, 4, 'testing new', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_ID` int NOT NULL,
  `username` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `type` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'user',
  `owner` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `viewStock` tinyint(1) NOT NULL DEFAULT '0',
  `viewReports` tinyint(1) NOT NULL DEFAULT '0',
  `deleteInvoice` tinyint(1) NOT NULL DEFAULT '0',
  `modifyCustomers` tinyint(1) NOT NULL DEFAULT '0',
  `user_status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_ID`, `username`, `password`, `type`, `owner`, `viewStock`, `viewReports`, `deleteInvoice`, `modifyCustomers`, `user_status`) VALUES
(1, 'admin', '21232f297a57a5a743894a0e4a801fc3', 'admin', 'admin', 1, 1, 1, 1, 1),
(2, 'user', 'ee11cbb19052e40b07aac0ca060c23ee', 'user', 'user', 1, 0, 1, 0, 1);

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
  MODIFY `customer_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `customers_payments`
--
ALTER TABLE `customers_payments`
  MODIFY `payment_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `debts_history`
--
ALTER TABLE `debts_history`
  MODIFY `record_ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `invoice_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoice_map`
--
ALTER TABLE `invoice_map`
  MODIFY `record_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `item_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `stock_categories`
--
ALTER TABLE `stock_categories`
  MODIFY `category_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
