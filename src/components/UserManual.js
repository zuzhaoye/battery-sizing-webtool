import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Divider } from '@mui/material';

const secondaryColor = "#353c3d"; // Define the secondary color 

function UserManual({ onClose }) {
  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogTitle style={{ backgroundColor: '#f5f5f5', padding: '24px' }}>
        <Typography variant="h4" component="h2" fontWeight="bold" align="center" color="primary">
          Battery Sizing Tool User Manual
        </Typography>
      </DialogTitle>
      
      <DialogContent style={{ padding: '24px' }}>
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            Introduction
          </Typography>
          <Typography variant="body1" align="justify" paragraph>
            The Battery Sizing Tool is a web application designed to help users determine the optimal battery energy storage system (BESS) size for their building. It allows users to input load profiles, energy prices, and system parameters to calculate the most cost-effective battery capacity and power limit.
          </Typography>
          <Typography variant="body1" align="justify" paragraph>
            Determining the right size for a battery storage system involves careful consideration of various trade-offs:
          </Typography>
          <Typography variant="body1" align="justify" paragraph style={{ paddingLeft: '16px' }}>
            • Under-investment in battery capacity may not provide sufficient storage to effectively offset load during peak demand periods, limiting the system's ability to reduce electricity bills.<br />
            • Over-investment can lead to excessive upfront costs, increasing the breakeven period and potentially making the system economically unviable.<br />
            • The optimal size balances these factors to maximize cost savings while ensuring a reasonable return on investment.
          </Typography>
          <Typography variant="body1" align="justify" paragraph>
            This sizing tool is designed to consider all these impacting factors, including load profiles, energy prices, system costs, and operational parameters. By analyzing these variables comprehensively, it helps users identify the sweet spot where the battery capacity is large enough to provide significant benefits but not so large as to diminish economic returns.
          </Typography>
        </Box>

        <Divider style={{ margin: '24px 0' }} />

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            Getting Started
          </Typography>
          <Typography variant="body1" align="justify" paragraph>
            Open the application in your web browser. You'll see a main page with several sections, each contained within an expandable panel.
          </Typography>
        </Box>

        <Divider style={{ margin: '24px 0' }} />

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            Using the Tool
          </Typography>

          <Box mb={3}>
            <Typography variant="h6" fontWeight="bold" color={secondaryColor}>
              1. Load and Energy Price Data
            </Typography>
            <Typography variant="body1" align="justify" paragraph>
              Expand the "Load and Energy Price Data" section. You'll see two charts: one for Load Profile and another for Energy Charge. Each chart allows you to adjust data points for a 24-hour period. 
              You can manually adjust points by dragging them on the chart. Alternatively, you can upload a CSV file with your data.
            </Typography>
            <Typography variant="body1" align="justify" paragraph style={{ paddingLeft: '16px' }}>
              • Download a CSV template by clicking "Download CSV Template".<br />
              • Adjust the content within the template.<br /> 
              • Click "Choose File" to select your CSV.<br />
              • Click "Upload" to load the data into the chart.
            </Typography>
          </Box>

          <Box mb={3}>
            <Typography variant="h6" fontWeight="bold" color={secondaryColor}>
              2. System Parameters
            </Typography>
            <Typography variant="body1" align="justify" paragraph>
              Expand the "System Parameters" section. You'll see a table with various parameters such as Demand Charge, Cost of Battery, etc. Adjust these values as needed for your specific scenario.
            </Typography>
            <Typography variant="body1" align="justify" paragraph>
              These inputs affect the optimal battery size and system performance.
            </Typography>
          </Box>

          <Box mb={3}>
            <Typography variant="h6" fontWeight="bold" color={secondaryColor}>
              3. Study Range
            </Typography>
            <Typography variant="body1" align="justify" paragraph>
              Expand the "Study Range" section. Set the minimum and maximum values for Battery Capacity and Power Limit. These ranges will be used in the optimization process to explore various scenarios and help identify the best solution.
            </Typography>
          </Box>

          <Box mb={3}>
            <Typography variant="h6" fontWeight="bold" color={secondaryColor}>
              4. Results
            </Typography>
            <Typography variant="body1" align="justify" paragraph>
              Scroll down to the "Results" section. Click the "Start Calculation" button to begin the optimization process. The progress bar will show the status of the calculation.
            </Typography>
            <Typography variant="body1" align="justify" paragraph>
              Once the calculation is complete, you will see three charts:<br />
              • <strong>Contour Chart</strong>: Displays lifetime costs across different combinations of battery capacity and power limit.<br />
              • <strong>Cost Comparison Over Time</strong>: Compares the costs of operating with and without a battery system, based on the optimal combination identified in the Contour Chart.<br />
              • <strong>Load and Battery SoC Profiles</strong>: Shows the original and new load profiles, along with the battery's state of charge, using the best combination from the analysis.
            </Typography>
          </Box>
        </Box>

        <Divider style={{ margin: '24px 0' }} />

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            Interpreting Results
          </Typography>
          <Typography variant="body1" align="justify" paragraph>
            The Contour Chart highlights the best combination with a red circle. The Cost Comparison chart shows which scenario (with or without battery) is more financially beneficial over time. The Load and Battery SoC Profiles help you understand how the battery system affects your load profile throughout the day.
          </Typography>
        </Box>

        <Divider style={{ margin: '24px 0' }} />

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            Troubleshooting
          </Typography>
          <Typography variant="body1" align="justify" paragraph>
            If you encounter an error message about memory constraints, try refreshing the website before starting a new analysis. Ensure that your CSV files match the expected format (Time in the first column, Value in the second). If charts are not displaying correctly, try adjusting your browser window size or zooming level.
          </Typography>
        </Box>

        <Divider style={{ margin: '24px 0' }} />

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            Conclusion
          </Typography>
          <Typography variant="body1" align="justify" paragraph>
            This tool provides valuable insights into optimal battery sizing for your specific scenario. By adjusting inputs and analyzing the results, you can make informed decisions about implementing a battery energy storage system in your building.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions style={{ padding: '16px 24px', backgroundColor: '#f5f5f5' }}>
        <Button onClick={onClose} color="primary" variant="contained" size="large">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserManual;