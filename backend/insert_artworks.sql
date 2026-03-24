USE `IT project`;
INSERT INTO artworks (title, description, price, stock_quantity, min_stock_threshold, category, image_url, deleted)
VALUES
('Sunset Painting', 'A beautiful painting of a sunset over the ocean', 500.00, 10, 2, 'Painting', 'test.jpg', false),
('Mountain View', 'A portrait of mountains', 250.00, 5, 1, 'Portrait', 'test.jpg', false),
('Abstract Geometric', 'A colorful abstract geometric piece', 150.00, 20, 5, 'Abstract', 'test.jpg', false),
('City Skyline Night', 'The city skyline illuminated at night', 350.00, 2, 1, 'Photography', 'test.jpg', false);
