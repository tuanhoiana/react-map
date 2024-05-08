import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  Select,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { FaLocationArrow, FaTimes } from "react-icons/fa";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { getHistory, getRealtime } from "./services/api";
import data from "./realtime.json";

const center = { lat: 106.05448, lng: 108.20836 };

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDSbDPP4tB6eUrumQSMQN4gjGh75aiANSk", // Config to env
    libraries: ["places"],
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destiantionRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const waypointsRef = useRef();
  // const [realtime, setRealtime] = useState(null);
  const [histories, setHistories] = useState([]);

  // Prepare bus stops - Fake datas
  const busStops = [
    {
      location:
        "Bệnh Viện Phụ Sản - Nhi Đà Nẵng, Đường Lê Văn Hiến, Khuê Mỹ, Ngũ Hành Sơn, Da Nang, Vietnam",
    },
    {
      location:
        "Trường Đại học Kiến trúc Đà Nẵng, Núi Thành, Hòa Cường, Hòa Cường Nam, Hải Châu District, Da Nang, Vietnam",
    },
    {
      location:
        "Bệnh Viện Quân Y C17, Nguyễn Hữu Thọ, Hòa Thuận Tây, Hải Châu District, Da Nang, Vietnam",
    },
  ];

  // Get current location from api realtime - useEffect
  const currentLocation = data.result.map((item) => ({
    lat: item.lat,
    lng: item.lng,
  }));

  // Call api history
  useEffect(() => {
    const fetchHistories = async () => {
      const data = await getHistory();
      setHistories(data);
    };

    fetchHistories();
  }, []);

  // Call api realtime
  // useEffect(() => {
  //   // TODO: try catch error
  //   const fetchRealtime = async () => {
  //     const data = await getRealtime();
  //     setRealtime(data);
  //   };

  //   fetchRealtime();
  // }, []);

  if (!isLoaded) {
    return <SkeletonText />;
  }

  // Calculate route
  const handleCalculateAndDisplayRoute = async () => {
    if (originRef.current === null || destiantionRef.current === null) {
      return;
    }

    // Selected multiple bus stops
    const waypts = [];
    const checkboxArray = waypointsRef.current;

    for (let i = 0; i < checkboxArray.length; i++) {
      if (checkboxArray.options[i].selected) {
        waypts.push({
          location: checkboxArray[i].value,
          stopover: true,
        });
      }
    }

    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: currentLocation[0], // Start point
      waypoints: waypts,
      destination: center, // End point
      optimizeWaypoints: true,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });
    console.log("myResult", results);

    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration?.text);
  };

  const handleClearRoute = () => {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destiantionRef.current.value = "";
  };

  console.log("histories", histories);

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={16}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
      >
        <Select placeholder="Choose route" mb={15}>
          <option value="hoianaToDaNang">Hoiana - Da Nang</option>
          <option value="hoianaToTamKy">Hoiana - Tam Ky</option>
          <option value="hoianaToHoiAn">Hoiana - Hoi An</option>
        </Select>
        <HStack spacing={2} justifyContent="space-between">
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type="text"
                placeholder="Origin - Realtime"
                ref={originRef}
              />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <select isFullWidth={true} multiple ref={waypointsRef}>
                {busStops.map((busStop, index) => (
                  <option key={index} value={busStop.location}>
                    {busStop.location}
                  </option>
                ))}
              </select>
            </Autocomplete>
          </Box>

          <ButtonGroup>
            <Button
              colorScheme="blue"
              type="submit"
              onClick={handleCalculateAndDisplayRoute}
            >
              Calculate Route
            </Button>
            <IconButton
              aria-label="center back"
              icon={<FaTimes />}
              onClick={handleClearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-between">
          <Text>Distance: {distance} </Text>
          <Text>Duration: {duration} </Text>
          <IconButton 
            aria-label="center back"
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map.panTo(currentLocation[0]);
              map.setZoom(16);
            }}
          />
        </HStack>
      </Box>
    </Flex>
  );
}

export default App;
