-- -- ============================================================
-- --  SmartFix - Extend Technicians Table
-- --  Safe to run: uses INSERT only, never touches existing rows
-- --  IDs 9 onwards (existing data: IDs 1-8)
-- -- ============================================================

-- -- OPTIONAL: Add CHECK constraint to category column if not present
-- -- ALTER TABLE technicians MODIFY COLUMN category ENUM(
-- --   'Plumbing','Electrical','Carpentry','General',
-- --   'Appliance','AC','Refrigerator','Washing Machine',
-- --   'Microwave','Geyser','Cleaning','Painting',
-- --   'Drainage','Leak','Furniture','Door','Window',
-- --   'Interior','CCTV','Inverter','Generator','Roofing',
-- --   'Wall Repair','Waterproofing','Pest Control','Gardening'
-- -- ) NOT NULL DEFAULT 'General';

-- -- ============================================================
-- --  BULK INSERT - 35 New Technicians (IDs 9 to 43)
-- -- ============================================================

-- INSERT INTO technicians (id, name, phone, category, status, address) VALUES

-- -- Appliance Technicians
-- (9,  'Ravi Kumar Sharma',     '9848012345', 'Appliance',      'Available', 'Ameerpet, Hyderabad'),
-- (10, 'Suresh Babu Yadav',     '9849023456', 'Appliance',      'Available', 'Kukatpally, Hyderabad'),

-- -- AC Technicians
-- (11, 'Praveen Reddy',         '9866034567', 'AC',             'Available', 'Banjara Hills, Hyderabad'),
-- (12, 'Mohammed Irfan',        '9877045678', 'AC',             'Available', 'Madhapur, Hyderabad'),
-- (13, 'Anil Verma',            '9898056789', 'AC',             'Busy',      'Gachibowli, Hyderabad'),

-- -- Refrigerator Technicians
-- (14, 'Srinivas Naidu',        '9912067890', 'Refrigerator',   'Available', 'Begumpet, Hyderabad'),
-- (15, 'Kiran Chandra Rao',     '9923078901', 'Refrigerator',   'Available', 'LB Nagar, Hyderabad'),

-- -- Washing Machine Technicians
-- (16, 'Venkat Ramaiah',        '9934089012', 'Washing Machine','Available', 'Secunderabad, Hyderabad'),
-- (17, 'Ashok Kumar Singh',     '9945090123', 'Washing Machine','Busy',      'Hitech City, Hyderabad'),

-- -- Microwave Technicians
-- (18, 'Deepak Tiwari',         '9956101234', 'Microwave',      'Available', 'Kondapur, Hyderabad'),
-- (19, 'Ramesh Nair',           '9967112345', 'Microwave',      'Available', 'Miyapur, Hyderabad'),

-- -- Geyser Technicians
-- (20, 'Sunil Prasad',          '9978123456', 'Geyser',         'Available', 'Dilsukhnagar, Hyderabad'),
-- (21, 'Naresh Pillai',         '9989134567', 'Geyser',         'Available', 'Himayatnagar, Hyderabad'),

-- -- Cleaning Technicians
-- (22, 'Santosh Kumar',         '9900145678', 'Cleaning',       'Available', 'Mehdipatnam, Hyderabad'),
-- (23, 'Vijay Lakshman',        '9801156789', 'Cleaning',       'Available', 'Panjagutta, Hyderabad'),
-- (24, 'Pradeep Mishra',        '9812167890', 'Cleaning',       'Busy',      'Somajiguda, Hyderabad'),

-- -- Painting Technicians
-- (25, 'Gopal Krishnaswamy',    '9823178901', 'Painting',       'Available', 'Shamshabad, Hyderabad'),
-- (26, 'Harish Gupta',          '9834189012', 'Painting',       'Available', 'Hayathnagar, Hyderabad'),

-- -- Drainage Technicians
-- (27, 'Manoj Dubey',           '9845190123', 'Drainage',       'Available', 'Ameerpet, Hyderabad'),
-- (28, 'Rakesh Shetty',         '9856201234', 'Drainage',       'Available', 'Gachibowli, Hyderabad'),

-- -- Leak Technicians
-- (29, 'Balaji Krishnan',       '9867212345', 'Leak',           'Available', 'Kukatpally, Hyderabad'),
-- (30, 'Dinesh Rao',            '9878223456', 'Leak',           'Available', 'Banjara Hills, Hyderabad'),

-- -- Furniture Technicians
-- (31, 'Sanjay Mehta',          '9889234567', 'Furniture',      'Available', 'Madhapur, Hyderabad'),
-- (32, 'Nitin Chauhan',         '9890245678', 'Furniture',      'Busy',      'Secunderabad, Hyderabad'),
-- --
-- -- Door Technicians
-- (33, 'Kamlesh Patel',         '9701256789', 'Door',           'Available', 'LB Nagar, Hyderabad'),
-- (34, 'Arvind Joshi',          '9712267890', 'Door',           'Available', 'Kondapur, Hyderabad'),

-- -- Window Technicians
-- (35, 'Raju Pandey',           '9723278901', 'Window',         'Available', 'Hitech City, Hyderabad'),
-- (36, 'Vivek Srivastava',      '9734289012', 'Window',         'Available', 'Miyapur, Hyderabad'),

-- -- Interior Technicians
-- (37, 'Rajesh Kapoor',         '9745290123', 'Interior',       'Available', 'Begumpet, Hyderabad'),
-- (38, 'Ajay Malhotra',         '9756301234', 'Interior',       'Available', 'Panjagutta, Hyderabad'),

-- -- CCTV Technicians
-- (39, 'Santosh Iyer',          '9767312345', 'CCTV',           'Available', 'Himayatnagar, Hyderabad'),
-- (40, 'Vinod Desai',           '9778323456', 'CCTV',           'Available', 'Somajiguda, Hyderabad'),

-- -- Inverter Technicians
-- (41, 'Ganesh Swamy',          '9789334567', 'Inverter',       'Available', 'Dilsukhnagar, Hyderabad'),

-- -- Generator Technicians
-- (42, 'Subramaniam Pillai',    '9790345678', 'Generator',      'Available', 'Shamshabad, Hyderabad'),

-- -- Roofing, Wall Repair, Waterproofing
-- (43, 'Hemant Rathore',        '9791356789', 'Roofing',        'Available', 'Hayathnagar, Hyderabad'),
-- (44, 'Bharat Saxena',         '9792367890', 'Wall Repair',    'Available', 'Ameerpet, Hyderabad'),
-- (45, 'Chetan Kulkarni',       '9793378901', 'Waterproofing',  'Available', 'Gachibowli, Hyderabad'),

-- -- Pest Control & Gardening
-- (46, 'Mahesh Tiwari',         '9794389012', 'Pest Control',   'Available', 'Madhapur, Hyderabad'),
-- (47, 'Prakash Nair',          '9795390123', 'Gardening',      'Available', 'Banjara Hills, Hyderabad');


-- -- ============================================================
-- --  VERIFICATION QUERIES (run after INSERT to confirm)
-- -- ============================================================

-- -- Total count
-- -- SELECT COUNT(*) AS total_technicians FROM technicians;

-- -- Count per category
-- -- SELECT category, COUNT(*) AS count, SUM(status='Available') AS available
-- -- FROM technicians
-- -- GROUP BY category
-- -- ORDER BY category;

-- -- Assignment query used by backend (replace ? with actual values)
-- -- SELECT *, (
-- --   (LOWER(address) LIKE '%ameerpet%') +
-- --   (LOWER(address) LIKE '%hyderabad%')
-- -- ) AS address_match_score
-- -- FROM technicians
-- -- WHERE category = 'AC'
-- --   AND status = 'Available'
-- -- ORDER BY address_match_score DESC, RAND()
-- -- LIMIT 1;
