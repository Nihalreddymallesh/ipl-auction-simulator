import type { Player, PlayerRole, BattingStyle, BowlingStyle } from '../types'

/**
 * IPL-style fan-made player database.
 * Stats are illustrative career-style numbers for simulation purposes only.
 * Images reference locally generated avatar assets (see ASSETS.md).
 */

type Row = [
  id: string,
  name: string,
  nationality: string,
  role: PlayerRole,
  bat: BattingStyle,
  bowl: BowlingStyle,
  base: number, // lakh
  rating: number,
  m: number, runs: number, avg: number, sr: number, fifties: number, hundreds: number,
  wkts: number, econ: number, bowlAvg: number, best: string, catches: number,
]

const ROWS: Row[] = [
  // ---- Marquee batters ----
  ['vk18', 'Virat Kohli', 'India', 'Batsman', 'Right-handed', 'Right-arm medium', 200, 97, 250, 8000, 38.5, 136.2, 55, 8, 4, 8.9, 92.0, '3/12', 110],
  ['rs45', 'Rohit Sharma', 'India', 'Batsman', 'Right-handed', 'Off break', 200, 94, 257, 6700, 30.8, 131.5, 43, 2, 15, 7.5, 48.0, '3/13', 60],
  ['sd63', 'Shubman Gill', 'India', 'Batsman', 'Right-handed', 'Off break', 150, 91, 118, 3400, 37.8, 138.0, 21, 3, 0, 0, 0, '-', 32],
  ['sk-yadav', 'Suryakumar Yadav', 'India', 'Batsman', 'Right-handed', 'None', 150, 93, 150, 3600, 32.1, 167.4, 26, 2, 0, 0, 0, '-', 44],
  ['kl-rahul', 'KL Rahul', 'India', 'Wicketkeeper', 'Right-handed', 'None', 150, 90, 132, 4200, 46.2, 134.6, 34, 4, 0, 0, 0, '-', 95],
  ['h-pandya', 'Hardik Pandya', 'India', 'All-rounder', 'Right-handed', 'Right-arm fast', 150, 88, 137, 2300, 28.4, 145.2, 10, 0, 192, 9.2, 29.5, '4/16', 58],
  ['rp23', 'Rishabh Pant', 'India', 'Wicketkeeper', 'Left-handed', 'None', 150, 89, 118, 3300, 34.9, 148.1, 18, 1, 0, 0, 0, '-', 78],
  ['j-buttler', 'Jos Buttler', 'England', 'Wicketkeeper', 'Right-handed', 'None', 150, 92, 107, 3500, 39.1, 149.7, 19, 7, 0, 0, 0, '-', 130],
  ['d-warner', 'David Warner', 'Australia', 'Batsman', 'Left-handed', 'Leg break', 150, 89, 184, 6500, 36.5, 139.8, 62, 4, 0, 0, 0, '-', 85],
  ['f-du-plessis', 'Faf du Plessis', 'South Africa', 'Batsman', 'Right-handed', 'None', 100, 87, 145, 4300, 36.2, 133.9, 37, 3, 0, 0, 0, '-', 82],

  // ---- All-rounders ----
  ['a-russell', 'Andre Russell', 'West Indies', 'All-rounder', 'Right-handed', 'Right-arm fast', 120, 90, 124, 2600, 30.2, 178.9, 11, 0, 115, 9.4, 27.1, '5/20', 52],
  ['g-maxwell', 'Glenn Maxwell', 'Australia', 'All-rounder', 'Right-handed', 'Off break', 120, 86, 134, 2800, 29.8, 156.3, 14, 0, 40, 8.8, 38.2, '3/19', 61],
  ['r-jadeja', 'Ravindra Jadeja', 'India', 'All-rounder', 'Left-handed', 'Left-arm orthodox', 120, 89, 240, 2900, 27.4, 129.1, 3, 0, 160, 7.6, 29.8, '5/16', 95],
  ['s-stoinis', 'Marcus Stoinis', 'Australia', 'All-rounder', 'Right-handed', 'Right-arm medium', 90, 81, 105, 2100, 27.6, 141.2, 8, 0, 42, 9.6, 35.4, '4/15', 47],
  ['l-ferguson', 'Lockie Ferguson', 'New Zealand', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 80, 80, 60, 180, 12.0, 128.0, 0, 0, 75, 8.9, 30.2, '4/14', 12],
  ['c-green', 'Cameron Green', 'Australia', 'All-rounder', 'Right-handed', 'Right-arm medium', 100, 83, 40, 900, 33.3, 144.1, 5, 0, 16, 9.1, 34.0, '3/12', 18],
  ['m-marsh', 'Mitchell Marsh', 'Australia', 'All-rounder', 'Right-handed', 'Right-arm medium', 90, 80, 90, 1900, 28.9, 132.5, 10, 0, 30, 9.3, 36.8, '3/12', 38],
  ['w-sundar', 'Washington Sundar', 'India', 'All-rounder', 'Left-handed', 'Off break', 75, 76, 110, 700, 22.4, 122.0, 1, 0, 38, 7.2, 31.5, '3/16', 41],
  ['a-patel', 'Axar Patel', 'India', 'All-rounder', 'Left-handed', 'Left-arm orthodox', 100, 84, 150, 1700, 24.9, 131.0, 6, 0, 112, 7.3, 28.9, '4/21', 63],
  ['d-hooda', 'Deepak Hooda', 'India', 'All-rounder', 'Right-handed', 'Off break', 60, 71, 105, 1400, 24.1, 128.4, 5, 0, 12, 8.4, 40.1, '2/9', 35],
  ['s-dube', 'Shivam Dube', 'India', 'All-rounder', 'Left-handed', 'Right-arm medium', 80, 79, 85, 1500, 28.7, 152.3, 6, 0, 25, 9.5, 38.4, '3/18', 24],
  ['v-shankar', 'Vijay Shankar', 'India', 'All-rounder', 'Right-handed', 'Right-arm medium', 50, 68, 80, 900, 23.8, 135.1, 3, 0, 18, 9.0, 39.5, '2/11', 22],

  // ---- Indian batters ----
  ['s-iyer', 'Shreyas Iyer', 'India', 'Batsman', 'Right-handed', 'Leg break', 120, 86, 120, 3200, 33.7, 136.8, 22, 1, 0, 0, 0, '-', 51],
  ['i-kishan', 'Ishan Kishan', 'India', 'Wicketkeeper', 'Left-handed', 'None', 100, 82, 105, 2700, 30.4, 142.9, 15, 1, 0, 0, 0, '-', 72],
  ['t-varma', 'Tilak Varma', 'India', 'Batsman', 'Left-handed', 'None', 75, 80, 55, 1600, 36.4, 143.7, 10, 0, 0, 0, 0, '-', 25],
  ['y-jaiswal', 'Yashasvi Jaiswal', 'India', 'Batsman', 'Left-handed', 'Leg break', 100, 85, 60, 1900, 34.5, 146.2, 13, 1, 0, 0, 0, '-', 21],
  ['r-gurbaz', 'Rahmanullah Gurbaz', 'Afghanistan', 'Wicketkeeper', 'Right-handed', 'None', 75, 78, 45, 1300, 30.2, 147.8, 8, 1, 0, 0, 0, '-', 40],
  ['s-samson', 'Sanju Samson', 'India', 'Wicketkeeper', 'Right-handed', 'None', 120, 87, 155, 3800, 34.8, 141.5, 20, 3, 0, 0, 0, '-', 105],
  ['d-padikkal', 'Devdutt Padikkal', 'India', 'Batsman', 'Left-handed', 'None', 60, 72, 75, 1500, 26.3, 132.1, 9, 0, 0, 0, 0, '-', 30],
  ['p-shaw', 'Prithvi Shaw', 'India', 'Batsman', 'Right-handed', 'None', 60, 73, 80, 1800, 25.9, 147.3, 10, 0, 0, 0, 0, '-', 28],
  ['v-iyer', 'Venkatesh Iyer', 'India', 'Batsman', 'Left-handed', 'Right-arm medium', 60, 74, 55, 1300, 27.8, 138.6, 7, 0, 4, 9.8, 44.0, '2/13', 19],
  ['a-sharma', 'Abhishek Sharma', 'India', 'All-rounder', 'Left-handed', 'Left-arm orthodox', 65, 79, 60, 1500, 30.1, 149.2, 9, 1, 11, 8.7, 36.2, '2/10', 17],
  ['n-pooran', 'Nicholas Pooran', 'West Indies', 'Wicketkeeper', 'Left-handed', 'None', 100, 86, 90, 2400, 31.9, 158.4, 12, 1, 0, 0, 0, '-', 68],
  ['t-curran', 'Tom Curran', 'England', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 50, 69, 45, 400, 18.2, 126.0, 0, 0, 45, 9.4, 33.8, '3/19', 14],
  ['k-mendis', 'Kusal Mendis', 'Sri Lanka', 'Wicketkeeper', 'Right-handed', 'None', 50, 72, 50, 1200, 28.4, 138.9, 7, 0, 0, 0, 0, '-', 35],
  ['b-king', 'Brandon King', 'West Indies', 'Batsman', 'Right-handed', 'None', 40, 70, 35, 850, 27.4, 141.2, 5, 0, 0, 0, 0, '-', 15],
  ['d-conway', 'Devon Conway', 'New Zealand', 'Batsman', 'Left-handed', 'None', 75, 82, 55, 1800, 40.2, 134.8, 15, 1, 0, 0, 0, '-', 26],
  ['r-rickelton', 'Ryan Rickelton', 'South Africa', 'Wicketkeeper', 'Left-handed', 'None', 40, 71, 25, 600, 31.6, 136.4, 4, 0, 0, 0, 0, '-', 12],
  ['q-de-kock', 'Quinton de Kock', 'South Africa', 'Wicketkeeper', 'Left-handed', 'None', 100, 85, 110, 3100, 34.2, 141.9, 21, 2, 0, 0, 0, '-', 98],
  ['t-head', 'Travis Head', 'Australia', 'Batsman', 'Left-handed', 'Off break', 100, 88, 65, 2200, 36.7, 168.2, 12, 1, 12, 8.9, 38.5, '2/14', 24],
  ['h-klaasen', 'Heinrich Klaasen', 'South Africa', 'Wicketkeeper', 'Right-handed', 'None', 100, 87, 60, 1900, 35.8, 162.7, 10, 1, 0, 0, 0, '-', 45],
  ['m-lomror', 'Mahipal Lomror', 'India', 'Batsman', 'Left-handed', 'None', 30, 64, 45, 550, 22.9, 128.4, 2, 0, 0, 0, 0, '-', 14],
  ['a-raza', 'Sikandar Raza', 'Zimbabwe', 'All-rounder', 'Right-handed', 'Off break', 50, 74, 40, 800, 26.7, 138.2, 4, 0, 28, 8.1, 30.4, '3/17', 20],
  ['s-hehet', 'Sharafuddin Ashraf', 'Afghanistan', 'All-rounder', 'Left-handed', 'Left-arm orthodox', 20, 58, 15, 120, 15.0, 118.0, 0, 0, 10, 8.0, 34.0, '2/12', 5],

  // ---- Fast bowlers ----
  ['j-bumrah', 'Jasprit Bumrah', 'India', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 200, 96, 133, 70, 8.2, 102.0, 0, 0, 165, 7.1, 21.9, '5/10', 28],
  ['m-shami', 'Mohammed Shami', 'India', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 100, 86, 110, 250, 12.4, 108.5, 0, 0, 127, 8.4, 27.3, '4/11', 18],
  ['m-siraj', 'Mohammed Siraj', 'India', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 90, 83, 95, 90, 10.1, 106.2, 0, 0, 108, 8.6, 29.1, '4/17', 15],
  ['a-nortje', 'Anrich Nortje', 'South Africa', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 90, 85, 55, 60, 9.8, 110.4, 0, 0, 72, 8.2, 25.4, '4/21', 10],
  ['k-rabada', 'Kagiso Rabada', 'South Africa', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 100, 88, 80, 200, 13.2, 116.0, 0, 0, 110, 8.5, 25.8, '4/25', 16],
  ['p-cummins', 'Pat Cummins', 'Australia', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 150, 90, 65, 350, 16.8, 128.4, 0, 0, 68, 8.3, 28.9, '4/34', 22],
  ['m-starc', 'Mitchell Starc', 'Australia', 'Fast Bowler', 'Left-handed', 'Left-arm fast', 150, 89, 50, 180, 14.1, 121.0, 0, 0, 58, 8.4, 27.6, '5/35', 9],
  ['t-boult', 'Trent Boult', 'New Zealand', 'Fast Bowler', 'Right-handed', 'Left-arm fast', 100, 86, 100, 150, 12.9, 114.2, 0, 0, 115, 8.2, 26.4, '4/18', 21],
  ['b-kumar', 'Bhuvneshwar Kumar', 'India', 'Fast Bowler', 'Right-handed', 'Right-arm medium', 80, 80, 145, 300, 12.1, 104.8, 0, 0, 175, 7.6, 25.9, '5/19', 30],
  ['ar-patel', 'Arshdeep Singh', 'India', 'Fast Bowler', 'Right-handed', 'Left-arm medium', 75, 82, 70, 60, 11.0, 109.4, 0, 0, 85, 8.5, 26.8, '5/32', 11],
  ['u-chahal', 'Yuzvendra Chahal', 'India', 'Spin Bowler', 'Right-handed', 'Leg break', 100, 85, 145, 200, 9.8, 96.4, 0, 0, 205, 8.0, 26.1, '6/25', 34],
  ['rashid-khan', 'Rashid Khan', 'Afghanistan', 'Spin Bowler', 'Right-handed', 'Leg break', 150, 94, 120, 750, 17.9, 128.6, 1, 0, 145, 6.9, 21.4, '4/12', 42],
  ['kuldeep-y', 'Kuldeep Yadav', 'India', 'Spin Bowler', 'Left-handed', 'Chinaman', 90, 85, 85, 150, 11.2, 101.8, 0, 0, 99, 7.7, 24.2, '4/14', 19],
  ['m-theekshana', 'Maheesh Theekshana', 'Sri Lanka', 'Spin Bowler', 'Right-handed', 'Off break', 60, 77, 45, 80, 10.4, 94.0, 0, 0, 55, 7.8, 26.9, '4/25', 8],
  ['a-joseph', 'Alzarri Joseph', 'West Indies', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 60, 76, 50, 90, 12.8, 111.0, 0, 0, 58, 9.0, 30.1, '6/12', 7],
  ['j-hazlewood', 'Josh Hazlewood', 'Australia', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 90, 84, 55, 40, 9.6, 98.0, 0, 0, 62, 7.9, 25.2, '4/22', 9],
  ['n-thakur', 'Nitish Rana', 'India', 'Batsman', 'Left-handed', 'Off break', 60, 74, 95, 2200, 27.4, 135.9, 12, 0, 6, 9.2, 42.0, '2/9', 33],
  ['m-markande', 'Mayank Markande', 'India', 'Spin Bowler', 'Right-handed', 'Leg break', 30, 66, 35, 40, 8.0, 92.0, 0, 0, 32, 8.8, 30.4, '4/23', 6],
  ['y-dayal', 'Yash Dayal', 'India', 'Fast Bowler', 'Right-handed', 'Left-arm fast', 40, 71, 40, 20, 8.0, 100.0, 0, 0, 42, 9.3, 32.8, '4/30', 5],
  ['v-chakaravarthy', 'Varun Chakravarthy', 'India', 'Spin Bowler', 'Right-handed', 'Leg break', 60, 79, 50, 60, 10.2, 95.0, 0, 0, 68, 7.9, 25.6, '5/20', 9],
  ['r-toppley', 'Reece Topley', 'England', 'Fast Bowler', 'Right-handed', 'Left-arm fast', 50, 73, 30, 15, 7.5, 96.0, 0, 0, 34, 8.7, 29.8, '4/28', 4],
  ['g-coetzee', 'Gerald Coetzee', 'South Africa', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 40, 72, 20, 60, 15.0, 130.0, 0, 0, 24, 9.4, 31.2, '3/21', 3],
  ['s-thakur', ' Shardul Thakur', 'India', 'Fast Bowler', 'Right-handed', 'Right-arm medium', 50, 73, 90, 500, 18.4, 128.9, 1, 0, 65, 9.2, 33.4, '4/36', 24],
  ['a-deep', 'Akash Deep', 'India', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 30, 70, 25, 10, 6.7, 90.0, 0, 0, 26, 8.9, 30.6, '3/18', 3],
  ['h-rauf', 'Haris Rauf', 'Pakistan', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 40, 74, 30, 40, 9.8, 112.0, 0, 0, 38, 9.1, 30.9, '4/23', 5],
  ['n-ahmed', 'Noor Ahmad', 'Afghanistan', 'Spin Bowler', 'Left-handed', 'Chinaman', 50, 78, 35, 30, 8.6, 98.0, 0, 0, 42, 7.6, 24.8, '5/19', 6],
  ['m-pathirana', 'Matheesha Pathirana', 'Sri Lanka', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 50, 77, 30, 20, 8.0, 104.0, 0, 0, 36, 8.8, 28.4, '4/32', 4],
  ['d-chahar', 'Deepak Chahar', 'India', 'Fast Bowler', 'Right-handed', 'Right-arm medium', 60, 76, 80, 300, 15.2, 112.4, 0, 0, 82, 8.3, 30.2, '4/13', 20],
  ['sandeep-s', 'Sandeep Sharma', 'India', 'Fast Bowler', 'Right-handed', 'Right-arm medium', 30, 69, 110, 120, 10.9, 102.0, 0, 0, 118, 8.5, 29.4, '4/21', 14],
  ['m-siraj2', 'Akash Madhwal', 'India', 'Fast Bowler', 'Right-handed', 'Right-arm fast', 20, 67, 15, 8, 5.3, 88.0, 0, 0, 18, 9.0, 28.9, '5/5', 2],

  // ---- Spinners & support ----
  ['r-ashwin', 'Ravichandran Ashwin', 'India', 'Spin Bowler', 'Right-handed', 'Off break', 90, 83, 200, 800, 20.4, 118.9, 1, 0, 171, 7.0, 27.8, '4/34', 46],
  ['a-patel2', 'Akeal Hosein', 'West Indies', 'Spin Bowler', 'Left-handed', 'Left-arm orthodox', 40, 72, 25, 150, 18.8, 118.0, 0, 0, 28, 7.4, 26.2, '3/15', 8],
  ['m-bracewell', 'Michael Bracewell', 'New Zealand', 'All-rounder', 'Left-handed', 'Off break', 50, 73, 30, 450, 25.7, 142.0, 2, 0, 18, 8.2, 31.8, '3/11', 10],
  ['s-narine', 'Sunil Narine', 'West Indies', 'All-rounder', 'Left-handed', 'Off break', 100, 85, 175, 1600, 24.8, 142.1, 7, 0, 180, 6.8, 24.9, '5/19', 52],
  ['moeen-ali', 'Moeen Ali', 'England', 'All-rounder', 'Left-handed', 'Off break', 75, 78, 70, 1300, 25.9, 141.8, 6, 0, 45, 7.9, 30.1, '3/19', 28],
  ['l-livingstone', 'Liam Livingstone', 'England', 'All-rounder', 'Right-handed', 'Leg break', 75, 79, 55, 1200, 27.8, 148.9, 7, 0, 15, 8.6, 34.2, '3/17', 22],
  ['t-david', 'Tim David', 'Singapore', 'Batsman', 'Right-handed', 'None', 75, 80, 45, 1100, 28.9, 172.4, 5, 0, 0, 0, 0, '-', 18],
  ['s-hetmyer', 'Shimron Hetmyer', 'West Indies', 'Batsman', 'Left-handed', 'None', 60, 77, 70, 1600, 31.2, 148.6, 8, 0, 0, 0, 0, '-', 30],
  ['r-powell', 'Rovman Powell', 'West Indies', 'Batsman', 'Right-handed', 'None', 50, 74, 40, 800, 26.7, 152.1, 4, 0, 0, 0, 0, '-', 16],
  ['d-miller', 'David Miller', 'South Africa', 'Batsman', 'Left-handed', 'None', 75, 81, 125, 2900, 34.8, 141.2, 12, 1, 0, 0, 0, '-', 55],
  ['a-finch', 'Aaron Finch', 'Australia', 'Batsman', 'Right-handed', 'None', 50, 72, 90, 2500, 30.1, 136.4, 18, 1, 0, 0, 0, '-', 40],
  ['m-henriques', 'Moises Henriques', 'Australia', 'All-rounder', 'Right-handed', 'Right-arm medium', 40, 70, 60, 1200, 27.3, 130.2, 6, 0, 25, 8.8, 34.6, '3/14', 21],
  ['d-willey', 'David Willey', 'England', 'Fast Bowler', 'Left-handed', 'Left-arm fast', 40, 71, 55, 600, 20.7, 138.4, 2, 0, 55, 8.6, 30.8, '4/22', 15],
  ['r-khan', 'Azmatullah Omarzai', 'Afghanistan', 'All-rounder', 'Right-handed', 'Right-arm fast-medium' as unknown as BowlingStyle, 50, 75, 25, 400, 26.7, 145.0, 2, 0, 12, 8.9, 33.0, '3/20', 8],
  ['s-ahmed', 'Suyash Sharma', 'India', 'Spin Bowler', 'Right-handed', 'Leg break', 20, 65, 15, 5, 4.5, 85.0, 0, 0, 16, 8.4, 29.8, '3/30', 2],
  ['k-ahmed', 'Khaleel Ahmed', 'India', 'Fast Bowler', 'Left-handed', 'Left-arm fast', 40, 72, 45, 20, 7.4, 98.0, 0, 0, 52, 8.8, 30.2, '4/25', 5],
  ['m-johnson', 'Spencer Johnson', 'Australia', 'Fast Bowler', 'Right-handed', 'Left-arm fast', 40, 73, 20, 10, 6.7, 95.0, 0, 0, 22, 9.0, 30.4, '3/25', 2],
  ['n-wadhera', 'Nehal Wadhera', 'India', 'Batsman', 'Left-handed', 'None', 20, 66, 20, 350, 24.1, 132.0, 2, 0, 0, 0, 0, '-', 7],
  ['a-manohar', 'Anmolpreet Singh', 'India', 'Batsman', 'Right-handed', 'None', 20, 62, 15, 200, 18.2, 124.0, 1, 0, 0, 0, 0, '-', 5],
  ['v-viyyakat', 'Vidwath Kaverappa', 'India', 'Fast Bowler', 'Right-handed', 'Right-arm medium', 20, 63, 10, 4, 4.0, 80.0, 0, 0, 10, 8.6, 31.0, '3/22', 1],
  ['p-dubey', 'Pravin Dubey', 'India', 'Spin Bowler', 'Right-handed', 'Leg break', 20, 60, 8, 2, 3.0, 75.0, 0, 0, 6, 9.0, 34.0, '2/25', 1],
]

function buildPlayer(row: Row): Player {
  const [id, name, nationality, role, battingStyle, bowlingStyle, basePrice, rating,
    matches, runs, average, strikeRate, fifties, hundreds,
    wickets, economy, bowlingAverage, bestBowling, catches] = row
  return {
    id,
    name: name.trim(),
    nationality,
    role,
    battingStyle,
    bowlingStyle,
    basePrice,
    rating,
    image: `/assets/players/${id}.svg`,
    stats: {
      matches, runs, average, strikeRate, fifties, hundreds,
      wickets, economy, bowlingAverage, bestBowling, catches,
    },
  }
}

export const PLAYER_DATABASE: Player[] = ROWS.map(buildPlayer)

/** Smaller pool for Quick Auction mode */
export function quickPool(): Player[] {
  const sorted = [...PLAYER_DATABASE].sort((a, b) => b.rating - a.rating)
  const picked: Player[] = []
  const seenRoles: Record<string, number> = {}
  for (const p of sorted) {
    const count = seenRoles[p.role] ?? 0
    if (count < 14) {
      picked.push(p)
      seenRoles[p.role] = count + 1
    }
  }
  return picked.slice(0, 60)
}

export function playersById(): Record<string, Player> {
  const map: Record<string, Player> = {}
  PLAYER_DATABASE.forEach((p) => {
    map[p.id] = p
  })
  return map
}

