import {
  createTravelPlan,
  getTravelPlansByUser,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan
} from '../database/dbService.js';

export const createPlan = async (req, res, next) => {
  const {
    personId,
    source,
    destination,
    dateOfGoing,
    dateOfReturning,
    activities,
    modeOfTransport,
    hotelRequired,
    hotelName,
    carRent
  } = req.body;

  if (!personId || !source || !destination) {
    return res.status(400).json({
      success: false,
      message: 'personId, source, and destination are required'
    });
  }

  try {
    const newPlan = await createTravelPlan(
      personId,
      source,
      destination,
      dateOfGoing,
      dateOfReturning,
      activities,
      modeOfTransport,
      hotelRequired,
      hotelName,
      carRent
    );
    return res.status(201).json({
      success: true,
      message: 'Travel plan created successfully',
      data: newPlan
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const getPlansByUser = async (req, res, next) => {
  const { personId } = req.params;

  try {
    const plans = await getTravelPlansByUser(personId);
    return res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

export const getPlanById = async (req, res, next) => {
  const { travelId } = req.params;

  try {
    const plan = await getTravelPlanById(parseInt(travelId, 10));
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Travel plan with id ${travelId} not found`
      });
    }
    return res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  const { travelId } = req.params;

  try {
    const updatedPlan = await updateTravelPlan(parseInt(travelId, 10), req.body);
    if (!updatedPlan) {
      return res.status(404).json({
        success: false,
        message: `Travel plan with id ${travelId} not found or no update was made`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Travel plan updated successfully',
      data: updatedPlan
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req, res, next) => {
  const { travelId } = req.params;

  try {
    const deletedPlan = await deleteTravelPlan(parseInt(travelId, 10));
    if (!deletedPlan) {
      return res.status(404).json({
        success: false,
        message: `Travel plan with id ${travelId} not found`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Travel plan deleted successfully',
      data: deletedPlan
    });
  } catch (error) {
    next(error);
  }
};
