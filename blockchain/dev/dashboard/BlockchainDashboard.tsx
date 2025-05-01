import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Send as SendIcon,
  AccountBalanceWallet as WalletIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  SwapHoriz as SwapIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Import blockchain API
import { BlockchainAPI } from '../api/BlockchainAPI';
import { WalletAPI } from '../api/WalletAPI';
import { BridgeAPI } from '../api/BridgeAPI';
import { AIAnalyticsAPI } from '../api/AIAnalyticsAPI';

// Types
import { Block, Transaction, BlockchainStats } from '../types';
import { BridgeTransaction, BlockchainNetwork } from '../bridge/CrossChainBridge';
import { AIPrediction, MarketData } from '../types/market';

// Dashboard components
import BlockExplorer from './components/BlockExplorer';
import TransactionList from './components/TransactionList';
import NetworkStats from './components/NetworkStats';
import WalletManager from './components/WalletManager';
import BridgeInterface from './components/BridgeInterface';
import AIInsights from './components/AIInsights';
import QuantumStatus from './components/QuantumStatus';
import SettingsPanel from './components/SettingsPanel';

// Theme
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
});

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
      style={{ padding: '24px 0' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Main dashboard component
const BlockchainDashboard: React.FC = () => {
  // State
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [bridgeTransactions, setBridgeTransactions] = useState<BridgeTransaction[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'warning' | 'error' });
  const [settingsOpen, setSettingsOpen] = useState(false);

  // APIs
  const blockchainAPI = new BlockchainAPI();
  const walletAPI = new WalletAPI();
  const bridgeAPI = new BridgeAPI();
  const aiAnalyticsAPI = new AIAnalyticsAPI();

  // Load data on mount
  useEffect(() => {
    loadData();
    // Set up polling for updates
    const interval = setInterval(() => {
      loadData(false);
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Load all dashboard data
  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      // Load blockchain data
      const [blocksData, statsData] = await Promise.all([
        blockchainAPI.getBlocks(10),
        blockchainAPI.getStats()
      ]);
      
      setBlocks(blocksData);
      setStats(statsData);
      
      // Extract transactions from blocks
      const txs = blocksData.flatMap(block => block.transactions);
      setTransactions(txs);
      
      // Load wallet data
      const balance = await walletAPI.getBalance();
      setWalletBalance(balance);
      
      // Load bridge data
      const bridgeTxs = await bridgeAPI.getTransactions();
      setBridgeTransactions(bridgeTxs);
      
      // Load market and AI data
      const [marketDataResult, predictionsResult] = await Promise.all([
        aiAnalyticsAPI.getMarketData(),
        aiAnalyticsAPI.getPredictions()
      ]);
      
      setMarketData(marketDataResult);
      setPredictions(predictionsResult);
      
      if (showLoading) {
        setSnackbar({
          open: true,
          message: 'Dashboard data loaded successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setSnackbar({
        open: true,
        message: `Error loading data: ${error.message}`,
        severity: 'error'
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadData(false);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle settings open/close
  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  // Render loading state
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" style={{ marginTop: 24 }}>
          Loading Kontour Coin Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="xl" style={{ paddingTop: 24, paddingBottom: 24 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Kontour Coin Blockchain Dashboard
          </Typography>
          <Box>
            <Tooltip title="Settings">
              <IconButton onClick={handleSettingsOpen} color="inherit">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} color="primary" disabled={refreshing}>
                {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Network Stats Overview */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total Blocks
                </Typography>
                <Typography variant="h4">
                  {stats?.totalBlocks.toLocaleString()}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (stats?.totalBlocks || 0) / 10000 * 100)} 
                  style={{ marginTop: 8, height: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Transactions
                </Typography>
                <Typography variant="h4">
                  {stats?.totalTransactions.toLocaleString()}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (stats?.totalTransactions || 0) / 100000 * 100)} 
                  style={{ marginTop: 8, height: 4 }}
                  color="secondary"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Network Difficulty
                </Typography>
                <Typography variant="h4">
                  {stats?.currentDifficulty}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (stats?.currentDifficulty || 0) / 10 * 100)} 
                  style={{ marginTop: 8, height: 4 }}
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Wallet Balance
                </Typography>
                <Typography variant="h4">
                  {walletBalance.toLocaleString()} KONTOUR
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, walletBalance / 1000 * 100)} 
                  style={{ marginTop: 8, height: 4 }}
                  color="info"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper style={{ marginBottom: 24 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<StorageIcon />} label="Blockchain" />
            <Tab icon={<TimelineIcon />} label="Transactions" />
            <Tab icon={<WalletIcon />} label="Wallet" />
            <Tab icon={<SwapIcon />} label="Bridge" />
            <Tab icon={<SecurityIcon />} label="Quantum Security" />
            <Tab icon={<InfoIcon />} label="AI Insights" />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <BlockExplorer blocks={blocks} stats={stats} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TransactionList transactions={transactions} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <WalletManager balance={walletBalance} transactions={transactions} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <BridgeInterface transactions={bridgeTransactions} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <QuantumStatus blockchain={blockchainAPI} />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <AIInsights marketData={marketData} predictions={predictions} />
        </TabPanel>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onClose={handleSettingsClose} maxWidth="md" fullWidth>
          <DialogTitle>Dashboard Settings</DialogTitle>
          <DialogContent>
            <SettingsPanel 
              onSettingsChanged={() => {
                handleSettingsClose();
                loadData();
              }} 
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSettingsClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default BlockchainDashboard;